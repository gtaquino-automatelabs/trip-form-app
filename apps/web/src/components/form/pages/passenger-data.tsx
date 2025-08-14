'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { passengerDataSchema, type PassengerData } from '@/schemas/passenger-data.schema';
import { useInputMask } from '@/hooks/use-input-mask';

interface PassengerDataPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface PassengerDataPageRef {
  validate: () => Promise<boolean>;
}

// Mock project list - in production this would come from an API
const projects = [
  { id: '1', name: 'Projeto Alpha' },
  { id: '2', name: 'Projeto Beta' },
  { id: '3', name: 'Projeto Gamma' },
  { id: '4', name: 'Projeto Delta' },
];

export const PassengerDataPage = forwardRef<PassengerDataPageRef, PassengerDataPageProps>(
  ({ onNext, onPrevious }, ref) => {
  const { formData, updateFormData } = useFormStore();
  const cpfMask = useInputMask('cpf');
  const phoneMask = useInputMask('phone');
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<PassengerData>({
    resolver: zodResolver(passengerDataSchema),
    mode: 'onBlur',
    defaultValues: {
      projectName: formData.projectName || '',
      passengerName: formData.passengerName || '',
      passengerEmail: formData.passengerEmail || '',
      rg: formData.rg || '',
      rgIssuer: formData.rgIssuer || '',
      cpf: formData.cpf || '',
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      phone: formData.phone || '',
      bankDetails: formData.bankDetails || '',
      requestType: formData.requestType || 'passages_per_diem',
    },
  });

  // Set initial values for masked inputs
  useEffect(() => {
    if (formData.cpf) {
      // Create a synthetic event to format the value
      const syntheticEvent = {
        target: { value: formData.cpf }
      } as React.ChangeEvent<HTMLInputElement>;
      cpfMask.handleChange(syntheticEvent);
      setValue('cpf', syntheticEvent.target.value);
    }
    if (formData.phone) {
      // Create a synthetic event to format the value
      const syntheticEvent = {
        target: { value: formData.phone }
      } as React.ChangeEvent<HTMLInputElement>;
      phoneMask.handleChange(syntheticEvent);
      setValue('phone', syntheticEvent.target.value);
    }
  }, [formData.cpf, formData.phone, cpfMask, phoneMask, setValue]);


  const onSubmit = async (data: PassengerData) => {
    // Save data to store with raw values
    updateFormData({
      projectName: data.projectName,
      passengerName: data.passengerName,
      passengerEmail: data.passengerEmail,
      rg: data.rg,
      rgIssuer: data.rgIssuer,
      cpf: data.cpf.replace(/\D/g, ''), // Store raw CPF
      birthDate: data.birthDate.toISOString(),
      phone: data.phone.replace(/\D/g, ''), // Store raw phone
      bankDetails: data.bankDetails,
      requestType: data.requestType,
    });

    // Navigate to next page after successful save
    if (onNext) {
      onNext();
    }
    return true;
  };

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
  }), [trigger, getValues]);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    cpfMask.handleChange(e);
    setValue('cpf', e.target.value);
    trigger('cpf');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    phoneMask.handleChange(e);
    setValue('phone', e.target.value);
    trigger('phone');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setValue('birthDate', date);
      trigger('birthDate');
    }
  };

  return (
    <form id="passenger-data-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form">
      <div className="space-y-4">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label htmlFor="projectName">
            Projeto Vinculado <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('projectName')}
            onValueChange={(value) => setValue('projectName', value)}
            disabled={isValidating || isSubmitting}
          >
            <SelectTrigger id="projectName">
              <SelectValue placeholder="Selecione o projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectName && (
            <p className="text-sm text-red-500">{errors.projectName.message}</p>
          )}
        </div>

        {/* Passenger Name */}
        <div className="space-y-2">
          <Label htmlFor="passengerName">
            Nome do Passageiro <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passengerName"
            type="text"
            {...register('passengerName')}
            placeholder="Digite seu nome completo"
            disabled={isValidating || isSubmitting}
          />
          {errors.passengerName && (
            <p className="text-sm text-red-500">{errors.passengerName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="passengerEmail">
            E-mail do Passageiro <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passengerEmail"
            type="email"
            {...register('passengerEmail')}
            placeholder="seu.email@exemplo.com"
            disabled={isValidating || isSubmitting}
          />
          {errors.passengerEmail && (
            <p className="text-sm text-red-500">{errors.passengerEmail.message}</p>
          )}
        </div>

        {/* RG and Issuer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rg">
              RG <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rg"
              type="text"
              {...register('rg')}
              placeholder="Digite seu RG"
              disabled={isValidating || isSubmitting}
            />
            {errors.rg && (
              <p className="text-sm text-red-500">{errors.rg.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rgIssuer">
              Órgão Expedidor <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rgIssuer"
              type="text"
              {...register('rgIssuer')}
              placeholder="Ex: SSP/SP"
              disabled={isValidating || isSubmitting}
            />
            {errors.rgIssuer && (
              <p className="text-sm text-red-500">{errors.rgIssuer.message}</p>
            )}
          </div>
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf">
            CPF <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cpf"
            type="text"
            value={cpfMask.value}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            disabled={isValidating || isSubmitting}
          />
          {errors.cpf && (
            <p className="text-sm text-red-500">{errors.cpf.message}</p>
          )}
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">
            Data de Nascimento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="birthDate"
            type="date"
            onChange={handleDateChange}
            defaultValue={formData.birthDate ? format(new Date(formData.birthDate), 'yyyy-MM-dd') : ''}
            disabled={isValidating || isSubmitting}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500">{errors.birthDate.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phoneMask.value}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            disabled={isValidating || isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Bank Details */}
        <div className="space-y-2">
          <Label htmlFor="bankDetails">
            Dados Bancários <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="bankDetails"
            {...register('bankDetails')}
            placeholder="Informe banco, agência, conta e tipo de conta"
            rows={3}
            disabled={isValidating || isSubmitting}
          />
          {errors.bankDetails && (
            <p className="text-sm text-red-500">{errors.bankDetails.message}</p>
          )}
        </div>

        {/* Request Type */}
        <div className="space-y-2">
          <Label>
            Tipo de Solicitação <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watch('requestType')}
            onValueChange={(value) => setValue('requestType', value as PassengerData['requestType'])}
            className="space-y-2"
            disabled={isValidating || isSubmitting}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="passages_per_diem" id="passages_per_diem" />
              <Label htmlFor="passages_per_diem" className="font-normal">
                Passagens e Diárias
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="passages_only" id="passages_only" />
              <Label htmlFor="passages_only" className="font-normal">
                Apenas Passagens
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="per_diem_only" id="per_diem_only" />
              <Label htmlFor="per_diem_only" className="font-normal">
                Apenas Diárias
              </Label>
            </div>
          </RadioGroup>
          {errors.requestType && (
            <p className="text-sm text-red-500">{errors.requestType.message}</p>
          )}
        </div>
      </div>
    </form>
  );
});

PassengerDataPage.displayName = 'PassengerDataPage';