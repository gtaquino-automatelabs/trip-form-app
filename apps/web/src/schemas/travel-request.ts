import { z } from 'zod';

// Portuguese error messages
const messages = {
  required: 'Campo obrigatório',
  email: 'E-mail inválido',
  min: (n: number) => `Mínimo de ${n} caracteres`,
  max: (n: number) => `Máximo de ${n} caracteres`,
  phone: 'Formato inválido. Use: (99) 99999-9999',
  cpf: 'CPF inválido',
  date: 'Data inválida',
  futureDate: 'A data deve ser futura',
  returnAfterDeparture: 'Data de retorno deve ser após a data de partida',
  url: 'URL inválida',
  positiveNumber: 'Deve ser um número positivo',
  selectOption: 'Selecione uma opção',
  atLeastOne: 'Selecione pelo menos uma opção'
};

// Personal Information Schema
const personalInfoSchema = z.object({
  projectName: z.string()
    .min(3, messages.min(3))
    .max(100, messages.max(100)),
  
  passengerName: z.string()
    .min(3, messages.min(3))
    .max(100, messages.max(100)),
  
  passengerEmail: z.string()
    .email(messages.email),
  
  rg: z.string()
    .min(5, messages.min(5))
    .max(20, messages.max(20)),
  
  rgIssuer: z.string()
    .min(2, messages.min(2))
    .max(10, messages.max(10)),
  
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, messages.cpf),
  
  birthDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]).refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 18 && age <= 120;
  }, 'Idade deve estar entre 18 e 120 anos'),
  
  phone: z.string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, messages.phone),
  
  bankDetails: z.string()
    .min(10, messages.min(10))
    .max(200, messages.max(200)),
  
  requestType: z.enum(['passages_per_diem', 'passages_only', 'per_diem_only'] as const)
});

// Travel Details Schema
const travelDetailsSchema = z.object({
  origin: z.string()
    .min(3, messages.min(3))
    .max(100, messages.max(100)),
  
  destination: z.string()
    .min(3, messages.min(3))
    .max(100, messages.max(100)),
  
  departureDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, messages.futureDate),
  
  returnDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]),
  
  transportType: z.enum(['air', 'road', 'both', 'own_car'] as const)
});

// Expense Types Schema
const expenseTypesSchema = z.object({
  expenseTypes: z.array(z.string())
    .min(1, messages.atLeastOne),
  
  otherExpenseDescription: z.string()
    .max(200, messages.max(200))
    .optional()
});

// Preferences Schema
const preferencesSchema = z.object({
  baggageAllowance: z.boolean(),
  transportAllowance: z.boolean(),
  estimatedDailyAllowance: z.number()
    .min(0, messages.positiveNumber)
    .max(10000, 'Valor máximo: R$ 10.000')
});

// International Travel Schema (conditional)
const internationalTravelSchema = z.object({
  isInternational: z.boolean(),
  passportNumber: z.string()
    .min(5, messages.min(5))
    .max(20, messages.max(20))
    .optional(),
  
  passportValidity: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]).optional(),
  
  passportImageUrl: z.string()
    .url(messages.url)
    .optional(),
  
  visaRequired: z.boolean()
    .optional()
});

// Time Restrictions Schema (conditional)
const timeRestrictionsSchema = z.object({
  hasTimeRestrictions: z.boolean(),
  timeRestrictionDetails: z.string()
    .min(10, messages.min(10))
    .max(500, messages.max(500))
    .optional()
});

// Flight Preferences Schema (conditional)
const flightPreferencesSchema = z.object({
  hasFlightPreferences: z.boolean(),
  
  flightSuggestionUrls: z.array(z.string().url(messages.url))
    .optional(),
  
  flightSuggestionFiles: z.array(
    z.object({
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileSize: z.number().positive(),
      fileType: z.string()
    })
  ).optional(),
  
  flightPreferences: z.string()
    .max(500, messages.max(500))
    .optional()
});

// Trip Objective Schema
const tripObjectiveSchema = z.object({
  tripObjective: z.string()
    .min(20, messages.min(20))
    .max(1000, messages.max(1000)),
  
  observations: z.string()
    .max(1000, messages.max(1000))
    .optional(),
  
  isUrgent: z.boolean(),
  
  urgentJustification: z.string()
    .min(10, messages.min(10))
    .max(500, messages.max(500))
    .optional()
});

// Complete Travel Request Schema
export const travelRequestSchema = z.object({
  ...personalInfoSchema.shape,
  ...travelDetailsSchema.shape,
  ...expenseTypesSchema.shape,
  ...preferencesSchema.shape,
  ...internationalTravelSchema.shape,
  ...timeRestrictionsSchema.shape,
  ...flightPreferencesSchema.shape,
  ...tripObjectiveSchema.shape
})
// Add refinements for conditional validations
.refine((data) => {
  // Return date must be after departure date
  if (data.departureDate && data.returnDate) {
    const departure = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    return returnDate > departure;
  }
  return true;
}, {
  message: messages.returnAfterDeparture,
  path: ['returnDate']
})
.refine((data) => {
  // If international, passport fields are required
  if (data.isInternational) {
    return !!data.passportNumber && !!data.passportValidity;
  }
  return true;
}, {
  message: 'Dados do passaporte são obrigatórios para viagens internacionais',
  path: ['passportNumber']
})
.refine((data) => {
  // If has time restrictions, details are required
  if (data.hasTimeRestrictions) {
    return !!data.timeRestrictionDetails && data.timeRestrictionDetails.length >= 10;
  }
  return true;
}, {
  message: 'Detalhes das restrições de horário são obrigatórios',
  path: ['timeRestrictionDetails']
})
.refine((data) => {
  // If urgent, justification is required
  if (data.isUrgent) {
    return !!data.urgentJustification && data.urgentJustification.length >= 10;
  }
  return true;
}, {
  message: 'Justificativa de urgência é obrigatória',
  path: ['urgentJustification']
})
.refine((data) => {
  // If other expense type selected, description is required
  if (data.expenseTypes?.includes('other')) {
    return !!data.otherExpenseDescription && data.otherExpenseDescription.length > 0;
  }
  return true;
}, {
  message: 'Descrição de outras despesas é obrigatória',
  path: ['otherExpenseDescription']
});

// Partial schemas for step-by-step validation
export const personalInfoValidationSchema = personalInfoSchema;
export const travelDetailsValidationSchema = travelDetailsSchema;
export const expenseTypesValidationSchema = expenseTypesSchema;
export const preferencesValidationSchema = preferencesSchema;
export const internationalTravelValidationSchema = internationalTravelSchema;
export const timeRestrictionsValidationSchema = timeRestrictionsSchema;
export const flightPreferencesValidationSchema = flightPreferencesSchema;
export const tripObjectiveValidationSchema = tripObjectiveSchema;

// Type exports
export type TravelRequestInput = z.infer<typeof travelRequestSchema>;
export type TravelRequestFormData = TravelRequestInput;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type TravelDetails = z.infer<typeof travelDetailsSchema>;
export type ExpenseTypes = z.infer<typeof expenseTypesSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type InternationalTravel = z.infer<typeof internationalTravelSchema>;
export type TimeRestrictions = z.infer<typeof timeRestrictionsSchema>;
export type FlightPreferences = z.infer<typeof flightPreferencesSchema>;
export type TripObjective = z.infer<typeof tripObjectiveSchema>;

// Pre-submission validation function
export const validateFormDataForSubmission = (data: any): { 
  success: boolean; 
  errors?: Record<string, string[]>;
  data?: TravelRequestInput;
} => {
  try {
    const validatedData = travelRequestSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Erro desconhecido na validação'] } };
  }
};

// Helper to validate individual form pages
export const validateFormPage = (pageNumber: number, data: any): {
  success: boolean;
  errors?: Record<string, string[]>;
} => {
  try {
    switch (pageNumber) {
      case 1:
        personalInfoValidationSchema.parse(data);
        break;
      case 2:
        travelDetailsValidationSchema.parse(data);
        break;
      case 3:
        expenseTypesValidationSchema.parse(data);
        break;
      case 4:
        preferencesValidationSchema.parse(data);
        break;
      case 5:
        internationalTravelValidationSchema.parse(data);
        break;
      case 6:
        timeRestrictionsValidationSchema.parse(data);
        break;
      case 7:
        flightPreferencesValidationSchema.parse(data);
        break;
      case 8:
        tripObjectiveValidationSchema.parse(data);
        break;
      default:
        throw new Error('Invalid page number');
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Erro na validação'] } };
  }
};