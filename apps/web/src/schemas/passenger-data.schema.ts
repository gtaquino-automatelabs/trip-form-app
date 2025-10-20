import { z } from 'zod';

// CPF validation function
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

// Phone validation (Brazilian format)
function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Mobile: 11 digits, Landline: 10 digits
  return cleaned.length === 10 || cleaned.length === 11;
}

// Age validation (must be 18+)
function validateAge(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

export const passengerDataSchema = z.object({
  projectName: z.string().min(1, 'Campo obrigatório'),
  
  passengerName: z.string()
    .min(1, 'Campo obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  
  passengerEmail: z.string()
    .min(1, 'Campo obrigatório')
    .email('E-mail inválido'),
  
  rg: z.string().min(1, 'Campo obrigatório'),
  
  rgIssuer: z.string().min(1, 'Campo obrigatório'),
  
  cpf: z.string()
    .min(1, 'Campo obrigatório')
    .refine(validateCPF, 'CPF inválido'),
  
  birthDate: z.date({
    required_error: 'Campo obrigatório',
    invalid_type_error: 'Data inválida',
  })
    .refine((date) => date <= new Date(), 'Data não pode ser no futuro')
    .refine(validateAge, 'Idade mínima de 18 anos'),
  
  phone: z.string()
    .min(1, 'Campo obrigatório')
    .refine(validatePhone, 'Telefone inválido'),
  
  // Bank details - structured fields
  bankName: z.string()
    .min(1, 'Campo obrigatório')
    .min(3, 'Nome do banco deve ter pelo menos 3 caracteres'),
  
  bankBranch: z.string()
    .min(1, 'Campo obrigatório')
    .min(3, 'Número da agência deve ter pelo menos 3 caracteres')
    .max(10, 'Número da agência deve ter no máximo 10 caracteres'),
  
  bankAccount: z.string()
    .min(1, 'Campo obrigatório')
    .min(5, 'Número da conta deve ter pelo menos 5 caracteres')
    .max(20, 'Número da conta deve ter no máximo 20 caracteres'),

  // Keep bankDetails for backwards compatibility and database storage
  bankDetails: z.string().optional(),
  
  requestType: z.enum(['passages_per_diem', 'passages_only', 'per_diem_only'] as const),
});

export type PassengerData = z.infer<typeof passengerDataSchema>;