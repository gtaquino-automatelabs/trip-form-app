'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays } from 'date-fns';

import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  preferencesSchema, 
  type Preferences 
} from '@/schemas/preferences.schema';

interface PreferencesPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface PreferencesPageRef {
  validate: () => Promise<boolean>;
}

export const PreferencesPage = forwardRef<PreferencesPageRef, PreferencesPageProps>(
  ({ onNext, onPrevious }, ref) => {
    const { formData, updateFormData } = useFormStore();
    const [isValidating, setIsValidating] = useState(false);

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      setValue,
      watch,
      trigger,
      getValues,
    } = useForm<Preferences>({
      resolver: zodResolver(preferencesSchema),
      mode: 'onChange',
      defaultValues: {
        baggageAllowance: formData.baggageAllowance ?? true, // Default to true
        transportAllowance: formData.transportAllowance ?? false, // Default to false
        estimatedDailyAllowance: formData.estimatedDailyAllowance || 0,
        hasTimeRestrictions: formData.hasTimeRestrictions ?? false,
        hasFlightPreferences: formData.hasFlightPreferences ?? false,
      },
    });

    // Calculate estimated days based on travel dates
    const calculateEstimatedDays = useCallback(() => {
      if (formData.departureDate && formData.returnDate) {
        const departure = new Date(formData.departureDate);
        const returnDate = new Date(formData.returnDate);
        const days = differenceInDays(returnDate, departure) + 1; // Include both departure and return days
        return Math.max(1, days); // Minimum of 1 day
      }
      return 1;
    }, [formData.departureDate, formData.returnDate]);

    // Auto-calculate daily allowance if not manually set
    useEffect(() => {
      const currentValue = watch('estimatedDailyAllowance');
      if (currentValue === 0 || !currentValue) {
        const estimatedDays = calculateEstimatedDays();
        setValue('estimatedDailyAllowance', estimatedDays);
      }
    }, [formData.departureDate, formData.returnDate, setValue, watch, calculateEstimatedDays]);

    const handleBaggageAllowanceChange = (checked: boolean) => {
      setValue('baggageAllowance', checked);
      trigger('baggageAllowance');
    };

    const handleTransportAllowanceChange = (checked: boolean) => {
      setValue('transportAllowance', checked);
      trigger('transportAllowance');
    };

    const handleDailyAllowanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setValue('estimatedDailyAllowance', value || 0);
      trigger('estimatedDailyAllowance');
    };

    const handleTimeRestrictionsChange = (checked: boolean) => {
      setValue('hasTimeRestrictions', checked);
      trigger('hasTimeRestrictions');
    };

    const handleFlightPreferencesChange = (checked: boolean) => {
      setValue('hasFlightPreferences', checked);
      trigger('hasFlightPreferences');
    };

    const onSubmit = useCallback(async (data: Preferences) => {
      // Save data to store
      updateFormData({
        baggageAllowance: data.baggageAllowance,
        transportAllowance: data.transportAllowance,
        estimatedDailyAllowance: data.estimatedDailyAllowance,
        hasTimeRestrictions: data.hasTimeRestrictions,
        hasFlightPreferences: data.hasFlightPreferences,
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
      <form id="preferences-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form">
        <div className="space-y-4">
          {/* Baggage Allowance */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="baggageAllowance"
              checked={watch('baggageAllowance')}
              onCheckedChange={handleBaggageAllowanceChange}
              disabled={isValidating || isSubmitting}
            />
            <Label htmlFor="baggageAllowance" className="font-normal">
              Necessita de franquia de bagagem?
            </Label>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            Marque esta opção se precisar despachar bagagem durante a viagem
          </p>

          {/* Transport Allowance */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transportAllowance"
              checked={watch('transportAllowance')}
              onCheckedChange={handleTransportAllowanceChange}
              disabled={isValidating || isSubmitting}
            />
            <Label htmlFor="transportAllowance" className="font-normal">
              Necessita de auxílio transporte?
            </Label>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            Marque esta opção se precisar de assistência com transporte local (táxi, uber, etc.)
          </p>

          {/* Daily Allowance Estimation */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDailyAllowance">
              Estimativa de diárias <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedDailyAllowance"
              type="number"
              min="1"
              max="365"
              value={watch('estimatedDailyAllowance') || ''}
              onChange={handleDailyAllowanceChange}
              placeholder="1"
              disabled={isValidating || isSubmitting}
            />
            {errors.estimatedDailyAllowance && (
              <p className="text-sm text-red-500">{errors.estimatedDailyAllowance.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Número estimado de diárias necessárias
              {formData.departureDate && formData.returnDate && (
                <span className="font-medium">
                  {' '}(Calculado automaticamente: {calculateEstimatedDays()} dias)
                </span>
              )}
            </p>
          </div>

          {/* Conditional Pages Triggers */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Informações Adicionais</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Marque as opções abaixo se precisar fornecer informações adicionais:
            </p>
            
            <div className="space-y-4">
              {/* Time Restrictions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasTimeRestrictions"
                  checked={watch('hasTimeRestrictions')}
                  onCheckedChange={handleTimeRestrictionsChange}
                  disabled={isValidating || isSubmitting}
                />
                <Label htmlFor="hasTimeRestrictions" className="font-normal">
                  Possui restrições de horário para voos?
                </Label>
              </div>
              <p className="text-sm text-gray-500 ml-6">
                Marque se tiver horários específicos de chegada ou partida, preferência por voos diretos, etc.
              </p>

              {/* Flight Preferences */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFlightPreferences"
                  checked={watch('hasFlightPreferences')}
                  onCheckedChange={handleFlightPreferencesChange}
                  disabled={isValidating || isSubmitting}
                />
                <Label htmlFor="hasFlightPreferences" className="font-normal">
                  Deseja sugerir voos específicos?
                </Label>
              </div>
              <p className="text-sm text-gray-500 ml-6">
                Marque se quiser anexar documentos ou links com sugestões de voos
              </p>
            </div>
          </div>

          {/* Helper Note */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Dica:</strong> O número de diárias é calculado automaticamente com base nas datas de ida e volta. 
              Você pode ajustar manualmente se necessário.
            </p>
          </div>
        </div>
      </form>
    );
  });

PreferencesPage.displayName = 'PreferencesPage';