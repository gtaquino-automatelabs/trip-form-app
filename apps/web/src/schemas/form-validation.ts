import { z } from 'zod';

// CPF validation helper
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Page 1: Passenger Data validation
export const passengerDataSchema = z.object({
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  passengerName: z.string().min(1, 'Nome do passageiro é obrigatório'),
  passengerEmail: z.string().email('Email inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  rgIssuer: z.string().min(1, 'Órgão emissor é obrigatório'),
  cpf: z.string().regex(cpfRegex, 'CPF deve estar no formato 000.000.000-00'),
  birthDate: z.union([z.date(), z.string().min(1, 'Data de nascimento é obrigatória')]),
  phone: z.string().regex(phoneRegex, 'Telefone deve estar no formato (00) 00000-0000'),
  bankDetails: z.string().min(1, 'Dados bancários são obrigatórios'),
  requestType: z.enum(['passages_per_diem', 'passages_only', 'per_diem_only'], {
    errorMap: () => ({ message: 'Tipo de solicitação é obrigatório' })
  })
});

// Page 2: Travel Details validation
export const travelDetailsSchema = z.object({
  origin: z.string().min(1, 'Origem é obrigatória'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  departureDate: z.union([z.date(), z.string().min(1, 'Data de ida é obrigatória')]),
  returnDate: z.union([z.date(), z.string().min(1, 'Data de volta é obrigatória')]),
  transportType: z.enum(['air', 'road', 'both', 'own_car'], {
    errorMap: () => ({ message: 'Tipo de transporte é obrigatório' })
  })
});

// Page 3: Expense Types validation
export const expenseTypesSchema = z.object({
  expenseTypes: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de despesa')
});

// Page 4: Preferences validation
export const preferencesSchema = z.object({
  baggageAllowance: z.boolean(),
  transportAllowance: z.boolean(),
  estimatedDailyAllowance: z.number().min(0, 'Valor da diária estimada deve ser positivo')
});

// Page 5: International Travel validation (conditional)
export const internationalTravelSchema = z.object({
  passportNumber: z.string().min(1, 'Número do passaporte é obrigatório'),
  passportValidity: z.union([z.date(), z.string().min(1, 'Validade do passaporte é obrigatória')]),
  visaRequired: z.boolean()
});

// Page 6: Time Restrictions validation (conditional)
export const timeRestrictionsSchema = z.object({
  timeRestrictionDetails: z.string().min(1, 'Detalhes das restrições são obrigatórios')
});

// Page 7: Flight Preferences validation (conditional)
export const flightPreferencesSchema = z.object({
  flightSuggestionUrls: z.array(z.string().url('URL inválida')).min(1, 'Adicione pelo menos uma sugestão de voo')
});

// Page 8: Trip Objective validation
export const tripObjectiveSchema = z.object({
  tripObjective: z.string().min(50, 'Objetivo da viagem deve ter pelo menos 50 caracteres'),
  observations: z.string().max(500, 'Observações não podem exceder 500 caracteres').optional(),
  isUrgent: z.boolean(),
  urgentJustification: z.string().optional()
}).refine(
  (data) => !data.isUrgent || (data.urgentJustification && data.urgentJustification.length >= 30),
  {
    message: 'Justificativa de urgência deve ter pelo menos 30 caracteres',
    path: ['urgentJustification']
  }
);

// Validation map by page
export const validationSchemas = {
  1: passengerDataSchema,
  2: travelDetailsSchema,
  3: expenseTypesSchema,
  4: preferencesSchema,
  5: internationalTravelSchema,
  6: timeRestrictionsSchema,
  7: flightPreferencesSchema,
  8: tripObjectiveSchema
} as const;

// Get validation schema for a specific page
export function getValidationSchema(page: number) {
  return validationSchemas[page as keyof typeof validationSchemas];
}

// Validate form data for a specific page
export function validatePageData(page: number, data: any) {
  const schema = getValidationSchema(page);
  if (!schema) {
    return { success: true, errors: {} };
  }

  try {
    // Ensure data is not null/undefined
    const safeData = data || {};
    
    // Use safeParse instead of parse to avoid throwing
    const result = schema.safeParse(safeData);
    
    if (result.success) {
      return { success: true, errors: {} };
    }
    
    // Extract errors from ZodError - safely handle the errors array
    const errors: Record<string, string> = {};
    if (result.error && result.error.errors && Array.isArray(result.error.errors)) {
      result.error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
    }
    
    return { success: false, errors };
  } catch (error) {
    console.error('Unexpected validation error:', error);
    return { success: false, errors: { general: 'Erro de validação inesperado' } };
  }
}