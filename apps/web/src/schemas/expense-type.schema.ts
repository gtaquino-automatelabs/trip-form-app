import { z } from 'zod';

// Expense type options with Portuguese labels
export const expenseTypeOptions = [
  { value: 'accommodation', label: 'Hospedagem' },
  { value: 'meals', label: 'Alimentação' },
  { value: 'local_transport', label: 'Transporte Local' },
  { value: 'event_registration', label: 'Inscrição em Evento' },
  { value: 'other', label: 'Outras Despesas' }
] as const;

export type ExpenseTypeValue = typeof expenseTypeOptions[number]['value'];

export const expenseTypeSchema = z.object({
  expenseTypes: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um tipo de despesa')
    .refine((types) => {
      // All selected types must be valid
      return types.every(type => 
        expenseTypeOptions.some(option => option.value === type)
      );
    }, 'Tipo de despesa inválido'),
  
  otherExpenseDescription: z
    .string()
    .optional()
}).refine((data) => {
  // If 'other' is selected, description is required
  if (data.expenseTypes.includes('other') && !data.otherExpenseDescription?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Especifique as outras despesas',
  path: ['otherExpenseDescription']
});

export type ExpenseType = z.infer<typeof expenseTypeSchema>;