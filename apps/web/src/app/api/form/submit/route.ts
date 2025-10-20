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
  // Structured bank fields
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
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

function mapTransportType(formValue: string): string {
  const mapping: Record<string, string> = {
    'air': 'flight',
    'road': 'bus',
    'both': 'other',
    'own_car': 'car_rental'
  };
  return mapping[formValue] || 'other';
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

    if (data.isInternational && (!data.passportNumber || !data.passportValidity)) {
      return NextResponse.json(
        {
          error: 'Número e validade do passaporte são obrigatórios para viagens internacionais',
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
      status: 'submitted',

      // Passenger info (all required)
      passenger_name: data.passengerName,
      passenger_email: data.passengerEmail,
      passenger_rg: data.rg,
      passenger_cpf: data.cpf,
      passenger_birth_date: data.birthDate,
      passenger_phone: data.phone,

      // Emergency contact (REQUIRED - auto-populate from passenger)
      emergency_contact_name: data.passengerName,
      emergency_contact_phone: data.phone,
      emergency_contact_email: data.passengerEmail,

      // Requester (REQUIRED - from authenticated user)
      requester_name: user.user_metadata?.full_name || data.passengerName,
      requester_email: user.email || data.passengerEmail,

      // Cost center (REQUIRED - use project name as placeholder)
      cost_center: data.projectName,
      cost_center_manager: 'Pending Assignment',

      // Project
      project_name: data.projectName,

      // Bank details (optional)
      bank_name: data.bankName || null,
      bank_branch: data.bankBranch || null,
      bank_account: data.bankAccount || null,

      // Travel details (all required)
      trip_origin: data.origin,
      trip_destination: data.destination,
      trip_start_date: data.departureDate,
      trip_end_date: data.returnDate,
      transport_type: mapTransportType(data.transportType),
      transport_details: null,

      // Expenses
      expense_types: data.expenseTypes,

      // Accommodation (not in current form)
      need_accommodation: null,
      accommodation_preferences: null,
      special_requests: null,

      // Allowances
      baggage_allowance: data.baggageAllowance,
      transport_allowance: data.transportAllowance,
      estimated_daily_allowance: data.estimatedDailyAllowance,

      // International
      is_international: data.isInternational,
      passport_number: data.isInternational ? data.passportNumber : null,
      passport_expiry: data.isInternational ? data.passportValidity : null,
      passport_issuing_country: null,
      visa_required: data.visaRequired || false,
      visa_information: null,

      // Time restrictions
      has_time_restrictions: data.hasTimeRestrictions,
      time_restrictions_details: data.timeRestrictionDetails || null,

      // Flight preferences (flightPreferences is a string, not object)
      preferred_airlines: null,
      preferred_departure_time: null,
      preferred_arrival_time: null,
      seat_preference: null,
      additional_notes: data.flightPreferences || data.observations || null,

      // Trip objective (required)
      trip_objective: data.tripObjective,
      expected_outcomes: data.observations || null,

      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
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