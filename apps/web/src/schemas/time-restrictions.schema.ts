import { z } from 'zod';

export const timeRestrictionsSchema = z.object({
  timeRestrictionDetails: z
    .string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .trim(),
    
  // Optional common restrictions that can auto-populate the text
  commonRestrictions: z.object({
    directFlights: z.boolean().optional(),
    avoidNightFlights: z.boolean().optional(),
    arriveBeforeTime: z.boolean().optional(),
    departAfterTime: z.boolean().optional(),
  }).optional(),
  
  arriveBeforeTime: z
    .string()
    .optional()
    .refine((time) => {
      if (!time) return true; // Optional field
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(time);
    }, 'Formato de hora inválido (HH:MM)'),
    
  departAfterTime: z
    .string()
    .optional()
    .refine((time) => {
      if (!time) return true; // Optional field
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(time);
    }, 'Formato de hora inválido (HH:MM)'),
});

export type TimeRestrictions = z.infer<typeof timeRestrictionsSchema>;

// Helper function to validate minimum character requirement
export const validateMinimumCharacters = (text: string, minChars: number = 20): boolean => {
  return text.trim().length >= minChars;
};

// Helper function to count characters
export const getCharacterCount = (text: string): number => {
  return text.length;
};