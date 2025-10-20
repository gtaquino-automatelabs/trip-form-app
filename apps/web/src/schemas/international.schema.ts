import { z } from 'zod';

export const internationalSchema = z.object({
  passportNumber: z
    .string()
    .min(6, 'Número do passaporte deve ter pelo menos 6 caracteres')
    .max(15, 'Número do passaporte deve ter no máximo 15 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Número do passaporte deve conter apenas letras maiúsculas e números'),
    
  passportValidity: z
    .string()
    .refine((date) => {
      const expiryDate = new Date(date);
      const today = new Date();
      return expiryDate > today;
    }, 'Passaporte deve ter validade futura')
    .refine((date) => {
      // Should be valid for at least 6 months from travel date
      // This validation will be enhanced when travel date is available
      const expiryDate = new Date(date);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      return expiryDate >= sixMonthsFromNow;
    }, 'Passaporte deve ser válido por pelo menos 6 meses'),
    
  passportImageUrl: z
    .string()
    .url('URL da imagem inválida')
    .min(1, 'É necessário fazer upload da foto do passaporte'),
    
  visaRequired: z
    .boolean()
    .optional(),
    
  visaDetails: z
    .string()
    .optional()
});

export type InternationalTravel = z.infer<typeof internationalSchema>;

// Enhanced validation function that considers travel date
export const validatePassportExpiry = (expiryDate: string, travelDate?: string): boolean => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  // Must be valid from today
  if (expiry <= today) return false;
  
  // If travel date is provided, must be valid for 6 months from travel date
  if (travelDate) {
    const travel = new Date(travelDate);
    const sixMonthsFromTravel = new Date(travel);
    sixMonthsFromTravel.setMonth(sixMonthsFromTravel.getMonth() + 6);
    return expiry >= sixMonthsFromTravel;
  }
  
  // Otherwise, must be valid for 6 months from today
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return expiry >= sixMonthsFromNow;
};