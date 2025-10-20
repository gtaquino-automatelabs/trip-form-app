import { z } from 'zod';

// CPF validation function (works with raw digits)
function validateCPF(cpf: string): boolean {
  // Remove non-digits
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 > 9) checkDigit1 = 0;
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 > 9) checkDigit2 = 0;
  
  // Verify check digits
  return (
    checkDigit1 === parseInt(cleaned[9]) &&
    checkDigit2 === parseInt(cleaned[10])
  );
}

// Phone validation function (works with raw digits)
function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Mobile: 11 digits, Landline: 10 digits
  return cleaned.length === 10 || cleaned.length === 11;
}

// Age validation (must be 18+)
function validateAge(birthDate: Date | string): boolean {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

// Page 1: Passenger Data validation (using raw data format)
export const passengerDataSchema = z.object({
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  passengerName: z.string().min(1, 'Nome do passageiro é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  passengerEmail: z.string().email('Email inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  rgIssuer: z.string().min(1, 'Órgão emissor é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório')
    .refine(validateCPF, 'CPF inválido'),
  birthDate: z.union([
    z.date(),
    z.string().min(1, 'Data de nascimento é obrigatória')
  ]).refine((date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj <= new Date();
  }, 'Data não pode ser no futuro')
  .refine(validateAge, 'Idade mínima de 18 anos'),
  phone: z.string().min(1, 'Telefone é obrigatório')
    .refine(validatePhone, 'Telefone inválido'),
  bankDetails: z.string().min(1, 'Dados bancários são obrigatórios')
    .min(10, 'Informe banco, agência, conta e tipo de conta'),
  requestType: z.enum(['passages_per_diem', 'passages_only', 'per_diem_only'] as const)
});

// Page 2: Travel Details validation
export const travelDetailsSchema = z.object({
  origin: z.string().min(1, 'Origem é obrigatória'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  departureDate: z.union([z.date(), z.string().min(1, 'Data de ida é obrigatória')]),
  returnDate: z.union([z.date(), z.string().min(1, 'Data de volta é obrigatória')]),
  transportType: z.enum(['air', 'road', 'both', 'own_car'] as const)
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
    
    // Extract errors from ZodError - use issues instead of errors
    const errors: Record<string, string> = {};
    if (result.error && 'issues' in result.error) {
      result.error.issues.forEach((issue) => {
        if (issue.path && issue.path.length > 0) {
          errors[String(issue.path[0])] = issue.message;
        }
      });
    }
    
    return { success: false, errors };
  } catch (error) {
    console.error('Unexpected validation error:', error);
    return { success: false, errors: { general: 'Erro de validação inesperado' } };
  }
}