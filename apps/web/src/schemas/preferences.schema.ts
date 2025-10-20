import { z } from 'zod';

export const preferencesSchema = z.object({
  baggageAllowance: z
    .boolean()
    .default(true), // Default to true as most travelers need baggage allowance
  
  transportAllowance: z
    .boolean()
    .default(false), // Default to false as not all travelers need transport assistance
  
  estimatedDailyAllowance: z
    .number({
      required_error: 'Estimativa de diárias é obrigatória',
      invalid_type_error: 'Número inválido'
    })
    .min(1, 'O valor deve ser maior que zero')
    .max(365, 'O número de diárias não pode exceder 365 dias')
    .int('O número de diárias deve ser um número inteiro'),
    
  // Conditional page triggers
  hasTimeRestrictions: z
    .boolean()
    .default(false),
    
  hasFlightPreferences: z
    .boolean()
    .default(false)
});

export type Preferences = z.infer<typeof preferencesSchema>;