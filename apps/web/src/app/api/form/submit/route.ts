import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const travelRequestSchema = z.object({
  // Passenger Data (Page 1)
  projectName: z.string().min(1, 'Projeto é obrigatório'),
  passengerName: z.string().min(1, 'Nome é obrigatório'),
  passengerEmail: z.string().email('E-mail inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  rgIssuer: z.string().min(1, 'Órgão expedidor é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  birthDate: z.string(),
  phone: z.string().min(10, 'Telefone inválido'),
  bankDetails: z.string().optional(),
  requestType: z.enum(['passages_per_diem', 'passages_only', 'per_diem_only']),
  
  // Travel Details (Page 2)
  origin: z.string().min(1, 'Origem é obrigatória'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  departureDate: z.string(),
  returnDate: z.string(),
  transportType: z.enum(['air', 'road', 'both', 'own_car']),
  
  // Expense Types (Page 3)
  expenseTypes: z.array(z.string()),
  otherExpenseDescription: z.string().optional(),
  
  // Preferences (Page 4)
  baggageAllowance: z.boolean(),
  transportAllowance: z.boolean(),
  estimatedDailyAllowance: z.number(),
  
  // International Travel (Page 5 - conditional)
  isInternational: z.boolean(),
  passportNumber: z.string().optional(),
  passportValidity: z.string().optional(),
  passportImageUrl: z.string().optional(),
  visaRequired: z.boolean().optional(),
  
  // Time Restrictions (Page 6 - conditional)
  hasTimeRestrictions: z.boolean(),
  timeRestrictionDetails: z.string().optional(),
  
  // Flight Preferences (Page 7 - conditional)
  hasFlightPreferences: z.boolean(),
  flightSuggestionUrls: z.array(z.string()).optional(),
  flightSuggestionFiles: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
  })).optional(),
  flightPreferences: z.string().optional(),
  
  // Trip Objective (Page 8)
  tripObjective: z.string().min(50, 'Objetivo deve ter no mínimo 50 caracteres'),
  observations: z.string().optional(),
  isUrgent: z.boolean(),
  urgentJustification: z.string().optional(),
});

function generateRequestNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `VG${year}${month}${day}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Por favor, faça login.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validate with schema
    const validationResult = travelRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: errors.fieldErrors 
        },
        { status: 400 }
      );
    }

    // Additional validation for conditional fields
    const data = validationResult.data;
    
    if (data.isUrgent && (!data.urgentJustification || data.urgentJustification.length < 30)) {
      return NextResponse.json(
        { 
          error: 'Justificativa de urgência deve ter no mínimo 30 caracteres',
        },
        { status: 400 }
      );
    }

    if (data.isInternational && !data.passportNumber) {
      return NextResponse.json(
        { 
          error: 'Número do passaporte é obrigatório para viagens internacionais',
        },
        { status: 400 }
      );
    }

    // Generate request number
    const requestNumber = generateRequestNumber();

    // Prepare data for database
    const travelRequest = {
      request_number: requestNumber,
      user_id: user.id,
      status: 'pending',
      
      // Passenger info
      project_name: data.projectName,
      passenger_name: data.passengerName,
      passenger_email: data.passengerEmail,
      rg: data.rg,
      rg_issuer: data.rgIssuer,
      cpf: data.cpf,
      birth_date: data.birthDate,
      phone: data.phone,
      bank_details: data.bankDetails,
      request_type: data.requestType,
      
      // Travel details
      origin: data.origin,
      destination: data.destination,
      departure_date: data.departureDate,
      return_date: data.returnDate,
      transport_type: data.transportType,
      
      // Expenses
      expense_types: data.expenseTypes,
      other_expense_description: data.otherExpenseDescription,
      
      // Preferences
      baggage_allowance: data.baggageAllowance,
      transport_allowance: data.transportAllowance,
      estimated_daily_allowance: data.estimatedDailyAllowance,
      
      // International
      is_international: data.isInternational,
      passport_number: data.passportNumber,
      passport_validity: data.passportValidity,
      passport_image_url: data.passportImageUrl,
      visa_required: data.visaRequired,
      
      // Time restrictions
      has_time_restrictions: data.hasTimeRestrictions,
      time_restriction_details: data.timeRestrictionDetails,
      
      // Flight preferences
      has_flight_preferences: data.hasFlightPreferences,
      flight_suggestion_urls: data.flightSuggestionUrls,
      flight_preferences: data.flightPreferences,
      
      // Trip objective
      trip_objective: data.tripObjective,
      observations: data.observations,
      is_urgent: data.isUrgent,
      urgent_justification: data.urgentJustification,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to database
    const { data: newRequest, error: insertError } = await supabase
      .from('travel_requests')
      .insert([travelRequest])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating travel request:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar solicitação. Por favor, tente novamente.' },
        { status: 500 }
      );
    }

    // Save flight files if any
    if (data.flightSuggestionFiles && data.flightSuggestionFiles.length > 0) {
      const fileRecords = data.flightSuggestionFiles.map(file => ({
        request_id: newRequest.id,
        file_name: file.fileName,
        file_url: file.fileUrl,
        file_size: file.fileSize,
        file_type: file.fileType,
        created_at: new Date().toISOString(),
      }));

      const { error: filesError } = await supabase
        .from('request_files')
        .insert(fileRecords);

      if (filesError) {
        console.error('Error saving files:', filesError);
      }
    }

    return NextResponse.json(
      { 
        success: true,
        id: newRequest.id,
        requestNumber: newRequest.request_number,
        message: 'Solicitação enviada com sucesso!'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Unexpected error in form submission:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}