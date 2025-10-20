'use client';

import React, { useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFormStore } from '@/stores/form-store';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  expenseTypeSchema, 
  type ExpenseType, 
  expenseTypeOptions,
  type ExpenseTypeValue 
} from '@/schemas/expense-type.schema';

interface ExpenseTypesPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface ExpenseTypesPageRef {
  validate: () => Promise<boolean>;
}

export const ExpenseTypesPage = forwardRef<ExpenseTypesPageRef, ExpenseTypesPageProps>(
  ({ onNext, onPrevious }, ref) => {
    const { formData, updateFormData } = useFormStore();
    const [isValidating, setIsValidating] = useState(false);

    const {
      handleSubmit,
      formState: { errors, isSubmitting },
      setValue,
      watch,
      trigger,
      getValues,
    } = useForm<ExpenseType>({
      resolver: zodResolver(expenseTypeSchema),
      mode: 'onChange',
      defaultValues: {
        expenseTypes: formData.expenseTypes || [],
        otherExpenseDescription: formData.otherExpenseDescription || '',
      },
    });

    const selectedExpenseTypes = watch('expenseTypes') || [];
    const otherExpenseDescription = watch('otherExpenseDescription') || '';
    const isOtherSelected = selectedExpenseTypes.includes('other');

    const handleExpenseToggle = (expenseValue: ExpenseTypeValue, checked: boolean) => {
      const currentExpenses = selectedExpenseTypes;
      let newExpenses: string[];
      
      if (checked) {
        newExpenses = [...currentExpenses, expenseValue];
      } else {
        newExpenses = currentExpenses.filter(e => e !== expenseValue);
        
        // If unchecking 'other', clear the description
        if (expenseValue === 'other') {
          setValue('otherExpenseDescription', '');
        }
      }
      
      setValue('expenseTypes', newExpenses);
      trigger('expenseTypes');
    };

    const handleOtherDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValue('otherExpenseDescription', value);
      trigger('otherExpenseDescription');
    };

    const onSubmit = useCallback(async (data: ExpenseType) => {
      // Save data to store
      updateFormData({
        expenseTypes: data.expenseTypes,
        otherExpenseDescription: data.otherExpenseDescription || '',
      });

      // Don't call onNext here - navigation is handled by the parent after validation
      return true;
    }, [updateFormData]);

    // Expose validation method for external validation
    useImperativeHandle(ref, () => ({
      validate: async () => {
        const isValid = await trigger();
        if (isValid) {
          const formValues = getValues();
          await onSubmit(formValues);
        }
        return isValid;
      }
    }), [trigger, getValues, onSubmit]);

    return (
      <form id="expense-types-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form">
        <div className="space-y-4">
          {/* Expense Type Selection */}
          <div className="space-y-4">
            <Label>
              Tipo de Despesa <span className="text-red-500">*</span>
            </Label>
            
            <div className="space-y-3">
              {expenseTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedExpenseTypes.includes(option.value)}
                    onCheckedChange={(checked) => handleExpenseToggle(option.value, checked as boolean)}
                    disabled={isValidating || isSubmitting}
                  />
                  <Label htmlFor={option.value} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            
            {errors.expenseTypes && (
              <p className="text-sm text-red-500">{errors.expenseTypes.message}</p>
            )}
          </div>

          {/* Other Expense Description - Conditional Field */}
          {isOtherSelected && (
            <div className="space-y-2">
              <Label htmlFor="otherExpenseDescription">
                Especifique Outras Despesas <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="otherExpenseDescription"
                value={otherExpenseDescription}
                onChange={handleOtherDescriptionChange}
                placeholder="Especifique outras despesas"
                rows={3}
                disabled={isValidating || isSubmitting}
              />
              {errors.otherExpenseDescription && (
                <p className="text-sm text-red-500">{errors.otherExpenseDescription.message}</p>
              )}
            </div>
          )}

          {/* Helper Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Selecione todos os tipos de despesas que você espera ter durante a viagem. 
              Isso ajudará no cálculo das diárias e na preparação da documentação necessária.
            </p>
          </div>
        </div>
      </form>
    );
  });

ExpenseTypesPage.displayName = 'ExpenseTypesPage';