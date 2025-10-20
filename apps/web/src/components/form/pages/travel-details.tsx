'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  travelDetailsSchema, 
  type TravelDetails, 
  transportTypeMap,
  type TransportType 
} from '@/schemas/travel-details.schema';
import { useCityAutocomplete } from '@/hooks/use-city-autocomplete';

interface TravelDetailsPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface TravelDetailsPageRef {
  validate: () => Promise<boolean>;
}

export const TravelDetailsPage = forwardRef<TravelDetailsPageRef, TravelDetailsPageProps>(
  ({ onNext, onPrevious }, ref) => {
    const { formData, updateFormData } = useFormStore();
    const [isValidating, setIsValidating] = useState(false);
    
    // Use custom hooks for origin and destination autocomplete
    const originAutocomplete = useCityAutocomplete();
    const destinationAutocomplete = useCityAutocomplete();

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      setValue,
      watch,
      trigger,
      getValues,
    } = useForm<TravelDetails>({
      resolver: zodResolver(travelDetailsSchema),
      mode: 'onBlur',
      defaultValues: {
        origin: formData.origin || '',
        destination: formData.destination || '',
        departureDate: formData.departureDate ? new Date(formData.departureDate) : undefined,
        returnDate: formData.returnDate ? new Date(formData.returnDate) : undefined,
        transportType: (formData.transportType as TransportType) || 'air',
      },
    });

    // Handle origin input change
    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue('origin', value);
      originAutocomplete.handleInputChange(value);
      trigger('origin');
    };

    // Handle destination input change
    const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue('destination', value);
      destinationAutocomplete.handleInputChange(value);
      trigger('destination');
    };

    // Handle city selection from suggestions
    const handleCitySelect = (cityLabel: string, type: 'origin' | 'destination') => {
      setValue(type, cityLabel);
      if (type === 'origin') {
        originAutocomplete.handleCitySelect({ value: '', label: cityLabel, state: '' });
      } else {
        destinationAutocomplete.handleCitySelect({ value: '', label: cityLabel, state: '' });
      }
      trigger(type);
    };

    // Handle date changes
    const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setValue('departureDate', date);
        trigger('departureDate');
        
        // If return date is before new departure date, clear it
        const returnDate = watch('returnDate');
        if (returnDate && returnDate < date) {
          setValue('returnDate', undefined as any);
        }
      }
    };

    const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setValue('returnDate', date);
        trigger('returnDate');
      }
    };

    const onSubmit = useCallback(async (data: TravelDetails) => {
      // Check if destination suggests international travel using the improved logic
      const isInternational = destinationAutocomplete.isInternationalDestination(data.destination);

      // Save data to store
      updateFormData({
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate.toISOString(),
        returnDate: data.returnDate.toISOString(),
        transportType: data.transportType,
        isInternational, // Update for conditional navigation
      });

      // Don't call onNext here - navigation is handled by the parent after validation
      return true;
    }, [updateFormData, destinationAutocomplete]);

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

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.city-autocomplete')) {
          originAutocomplete.handleClose();
          destinationAutocomplete.handleClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [originAutocomplete, destinationAutocomplete]);

    return (
      <form id="travel-details-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form">
        <div className="space-y-4">
          {/* Origin City */}
          <div className="space-y-2 city-autocomplete">
            <Label htmlFor="origin">
              Cidade de Origem <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="origin"
                type="text"
                value={watch('origin')}
                onChange={handleOriginChange}
                placeholder="Digite a cidade de origem"
                disabled={isValidating || isSubmitting}
                autoComplete="off"
              />
              {originAutocomplete.isOpen && originAutocomplete.filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {originAutocomplete.filteredCities.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => handleCitySelect(city.label, 'origin')}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.origin && (
              <p className="text-sm text-red-500">{errors.origin.message}</p>
            )}
          </div>

          {/* Destination City */}
          <div className="space-y-2 city-autocomplete">
            <Label htmlFor="destination">
              Cidade de Destino <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="destination"
                type="text"
                value={watch('destination')}
                onChange={handleDestinationChange}
                placeholder="Digite a cidade de destino"
                disabled={isValidating || isSubmitting}
                autoComplete="off"
              />
              {destinationAutocomplete.isOpen && destinationAutocomplete.filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {destinationAutocomplete.filteredCities.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => handleCitySelect(city.label, 'destination')}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.destination && (
              <p className="text-sm text-red-500">{errors.destination.message}</p>
            )}
          </div>

          {/* Travel Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">
                Data de Ida <span className="text-red-500">*</span>
              </Label>
              <Input
                id="departureDate"
                type="date"
                onChange={handleDepartureDateChange}
                defaultValue={formData.departureDate ? format(new Date(formData.departureDate), 'yyyy-MM-dd') : ''}
                disabled={isValidating || isSubmitting}
                min={format(new Date(), 'yyyy-MM-dd')} // Prevent past dates
              />
              {errors.departureDate && (
                <p className="text-sm text-red-500">{errors.departureDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnDate">
                Data de Volta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="returnDate"
                type="date"
                onChange={handleReturnDateChange}
                defaultValue={formData.returnDate ? format(new Date(formData.returnDate), 'yyyy-MM-dd') : ''}
                disabled={isValidating || isSubmitting}
                min={watch('departureDate') ? format(watch('departureDate'), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.returnDate && (
                <p className="text-sm text-red-500">{errors.returnDate.message}</p>
              )}
            </div>
          </div>

          {/* Transport Type */}
          <div className="space-y-2">
            <Label>
              Tipo de Transporte <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={watch('transportType')}
              onValueChange={(value) => setValue('transportType', value as TransportType)}
              className="space-y-2"
              disabled={isValidating || isSubmitting}
            >
              {Object.entries(transportTypeMap).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} />
                  <Label htmlFor={value} className="font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.transportType && (
              <p className="text-sm text-red-500">{errors.transportType.message}</p>
            )}
          </div>
        </div>
      </form>
    );
  });

TravelDetailsPage.displayName = 'TravelDetailsPage';