import { z } from 'zod';

export const preferencesSchema = z.object({
  baggageAllowance: z.boolean(),

  transportAllowance: z.boolean(),

  estimatedDailyAllowance: z
    .number({
      message: 'Número inválido'
    })
    .min(1, 'O valor deve ser maior que zero')
    .max(365, 'O número de diárias não pode exceder 365 dias')
    .int('O número de diárias deve ser um número inteiro'),

  // Conditional page triggers
  hasTimeRestrictions: z.boolean(),

  hasFlightPreferences: z.boolean()
});

export type Preferences = z.infer<typeof preferencesSchema>;