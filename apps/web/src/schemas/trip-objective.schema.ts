import { z } from 'zod';

// Trip Objective validation schema
export const tripObjectiveSchema = z.object({
  tripObjective: z
    .string()
    .min(50, 'O objetivo da viagem deve ter no mínimo 50 caracteres')
    .max(1000, 'O objetivo da viagem não pode exceder 1000 caracteres'),
  
  observations: z
    .string()
    .max(500, 'As observações não podem exceder 500 caracteres')
    .optional(),
  
  isUrgent: z.boolean().default(false),
  
  urgentJustification: z
    .string()
    .min(30, 'A justificativa de urgência deve ter no mínimo 30 caracteres')
    .max(500, 'A justificativa de urgência não pode exceder 500 caracteres')
    .optional()
}).refine(
  (data) => {
    // If urgent is marked, justification is required
    if (data.isUrgent && (!data.urgentJustification || data.urgentJustification.length < 30)) {
      return false;
    }
    return true;
  },
  {
    message: 'Justificativa de urgência é obrigatória e deve ter no mínimo 30 caracteres',
    path: ['urgentJustification']
  }
);

// Type inference
export type TripObjectiveFormData = z.infer<typeof tripObjectiveSchema>;

// Portuguese error messages
export const tripObjectiveErrorMessages = {
  tripObjective: {
    required: 'O objetivo da viagem é obrigatório',
    minLength: 'Descreva o objetivo com mais detalhes (mínimo 50 caracteres)',
    maxLength: 'O objetivo está muito longo (máximo 1000 caracteres)'
  },
  observations: {
    maxLength: 'As observações estão muito longas (máximo 500 caracteres)'
  },
  urgentJustification: {
    required: 'A justificativa de urgência é obrigatória',
    minLength: 'Explique melhor a urgência (mínimo 30 caracteres)',
    maxLength: 'A justificativa está muito longa (máximo 500 caracteres)'
  }
};

// Validation helper
export function validateTripObjective(data: unknown) {
  try {
    const result = tripObjectiveSchema.parse(data);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};

      Object.keys(errors).forEach((key) => {
        const errorArray = errors[key as keyof typeof errors] as string[] | undefined;
        if (errorArray && Array.isArray(errorArray) && errorArray.length > 0) {
          formattedErrors[key] = errorArray[0];
        }
      });

      return { success: false, data: null, errors: formattedErrors };
    }
    
    return { 
      success: false, 
      data: null, 
      errors: { general: 'Erro ao validar formulário' } 
    };
  }
}