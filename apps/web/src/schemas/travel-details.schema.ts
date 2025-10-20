import { z } from 'zod';

// Transport type enum mapping to Portuguese labels
export const transportTypeMap = {
  'air': 'Aéreo',
  'road': 'Rodoviário', 
  'both': 'Ambos',
  'own_car': 'Carro Próprio'
} as const;

export type TransportType = keyof typeof transportTypeMap;

export const travelDetailsSchema = z.object({
  origin: z
    .string()
    .min(1, 'Campo obrigatório')
    .min(2, 'Cidade de origem deve ter pelo menos 2 caracteres'),
  
  destination: z
    .string()
    .min(1, 'Campo obrigatório')
    .min(2, 'Cidade de destino deve ter pelo menos 2 caracteres'),
  
  departureDate: z
    .date({
      required_error: 'Data de ida é obrigatória',
      invalid_type_error: 'Data inválida'
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'A data de ida não pode ser no passado'),
  
  returnDate: z
    .date({
      required_error: 'Data de volta é obrigatória',
      invalid_type_error: 'Data inválida'
    }),
  
  transportType: z
    .enum(['air', 'road', 'both', 'own_car'], {
      required_error: 'Tipo de transporte é obrigatório',
      invalid_type_error: 'Tipo de transporte inválido'
    })
}).refine((data) => {
  // Validate return date is after departure date
  return data.returnDate >= data.departureDate;
}, {
  message: 'A data de volta deve ser igual ou posterior à data de ida',
  path: ['returnDate']
});

export type TravelDetails = z.infer<typeof travelDetailsSchema>;