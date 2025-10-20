import { NextRequest, NextResponse } from 'next/server';
import { createId } from '@paralleldrive/cuid2';
import { createSupabaseServerClient, requireAuth } from '@/lib/supabase-server';
import { validateFormDataForSubmission } from '@/schemas/travel-request';

// Error response type
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | null;
  };
}

// Success response type
interface SuccessResponse {
  success: true;
  data: {
    requestId: string;
    message: string;
  };
}

// Helper function to format error responses
function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]> | null,
  status: number = 400
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

// Helper function to format success responses
function successResponse(requestId: string): NextResponse<SuccessResponse> {
  return NextResponse.json({
    success: true,
    data: {
      requestId,
      message: 'Solicitação enviada com sucesso',
    },
  });
}

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes('VALIDATION')) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Simple in-memory cache for idempotency (in production, use Redis or database)
const idempotencyCache = new Map<string, { response: ErrorResponse | SuccessResponse; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      idempotencyCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

export async function POST(request: NextRequest) {
  try {
    // Add CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    // Check for idempotency key
    const idempotencyKey = request.headers.get('X-Idempotency-Key');
    
    if (idempotencyKey) {
      // Check cache for existing response
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Returning cached response for idempotency key: ${idempotencyKey}`);
        return NextResponse.json(cached.response, { status: 200 });
      }
    }

    // Authenticate user
    let session;
    try {
      session = await requireAuth();
    } catch (error) {
      return errorResponse('UNAUTHORIZED', 'Usuário não autenticado', null, 401);
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return errorResponse('INVALID_REQUEST', 'Dados inválidos no corpo da requisição');
    }

    // Validate form data
    const validation = validateFormDataForSubmission(requestData);
    
    if (!validation.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Erro na validação dos dados',
        validation.errors
      );
    }

    const validatedData = validation.data!;

    // Generate unique request ID
    const requestId = `REQ-${new Date().getFullYear()}-${createId().slice(0, 8).toUpperCase()}`;

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Prepare data for insertion
    const travelRequestData = {
      id: requestId,
      user_id: session.user.id,
      status: 'submitted',
      personal_info: {
        project_name: validatedData.projectName,
        passenger_name: validatedData.passengerName,
        passenger_email: validatedData.passengerEmail,
        rg: validatedData.rg,
        rg_issuer: validatedData.rgIssuer,
        cpf: validatedData.cpf,
        birth_date: validatedData.birthDate,
        phone: validatedData.phone,
        // Structured bank fields
        bank_name: validatedData.bankName,
        bank_branch: validatedData.bankBranch,
        bank_account: validatedData.bankAccount,
        request_type: validatedData.requestType,
      },
      travel_details: {
        origin: validatedData.origin,
        destination: validatedData.destination,
        departure_date: validatedData.departureDate,
        return_date: validatedData.returnDate,
        transport_type: validatedData.transportType,
        is_international: validatedData.isInternational,
        is_urgent: validatedData.isUrgent,
        urgent_justification: validatedData.urgentJustification,
      },
      expense_info: {
        expense_types: validatedData.expenseTypes,
        other_expense_description: validatedData.otherExpenseDescription,
        baggage_allowance: validatedData.baggageAllowance,
        transport_allowance: validatedData.transportAllowance,
        estimated_daily_allowance: validatedData.estimatedDailyAllowance,
      },
      passport_info: validatedData.isInternational
        ? {
            passport_number: validatedData.passportNumber,
            passport_validity: validatedData.passportValidity,
            passport_image_url: validatedData.passportImageUrl,
            visa_required: validatedData.visaRequired,
          }
        : null,
      restrictions: {
        has_time_restrictions: validatedData.hasTimeRestrictions,
        time_restriction_details: validatedData.timeRestrictionDetails,
        has_flight_preferences: validatedData.hasFlightPreferences,
        flight_preferences: validatedData.flightPreferences,
      },
      files: {
        passport_image_url: validatedData.passportImageUrl,
        flight_suggestion_urls: validatedData.flightSuggestionUrls,
        flight_suggestion_files: validatedData.flightSuggestionFiles,
      },
      additional_info: {
        trip_objective: validatedData.tripObjective,
        observations: validatedData.observations,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert with retry mechanism
    const insertOperation = async () => {
      const { data, error } = await supabase
        .from('travel_requests')
        .insert(travelRequestData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        
        // Check for specific database errors
        if (error.code === '23505') {
          // Duplicate key error - generate new ID and retry
          throw new Error('DUPLICATE_ID');
        }
        
        throw new Error(`DATABASE_ERROR: ${error.message}`);
      }

      return data;
    };

    try {
      // Attempt to insert with retry logic
      const insertedData = await retryWithBackoff(insertOperation);
      
      // Log successful submission
      console.log(`Travel request ${requestId} submitted successfully for user ${session.user.id}`);
      
      // Cache the successful response if idempotency key is provided
      if (idempotencyKey) {
        const response = {
          success: true,
          data: {
            requestId,
            message: 'Solicitação enviada com sucesso',
          },
        };
        idempotencyCache.set(idempotencyKey, {
          response,
          timestamp: Date.now(),
        });
      }
      
      // Return success response
      return successResponse(requestId);
      
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'DUPLICATE_ID') {
          // This shouldn't happen with CUID, but handle it gracefully
          return errorResponse(
            'DUPLICATE_REQUEST',
            'Erro ao gerar ID único. Por favor, tente novamente.',
            null,
            500
          );
        }
        
        if (error.message.includes('DATABASE_ERROR')) {
          return errorResponse(
            'DATABASE_ERROR',
            'Erro ao salvar a solicitação no banco de dados',
            error.message,
            500
          );
        }
      }
      
      throw error; // Re-throw to be caught by outer try-catch
    }

  } catch (error) {
    console.error('Unexpected error in form submission:', error);
    
    // Generic error response
    return errorResponse(
      'INTERNAL_ERROR',
      'Erro interno do servidor. Por favor, tente novamente mais tarde.',
      process.env.NODE_ENV === 'development' ? error : undefined,
      500
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}