'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BankSelect } from '@/components/form/bank-select';
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
import { useProjects } from '@/hooks/useProjects';
import { usePassengerProfile } from '@/hooks/usePassengerProfile';
import { Button } from '@/components/ui/button';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PassengerDataPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface PassengerDataPageRef {
  validate: () => Promise<boolean>;
}

export const PassengerDataPage = forwardRef<PassengerDataPageRef, PassengerDataPageProps>(
  ({ onNext: _onNext, onPrevious: _onPrevious }, ref) => {
  const { formData, updateFormData } = useFormStore();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects, clearError: clearProjectsError } = useProjects();
  const { profile, hasProfile, isSaving, saveProfile } = usePassengerProfile();
  const cpfMask = useInputMask('cpf');
  const phoneMask = useInputMask('phone');
  const dateMask = useInputMask('date');
  const [isValidating, _setIsValidating] = useState(false);
  const searchParams = useSearchParams();
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

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
      // New structured bank fields
      bankName: formData.bankName || '',
      bankBranch: formData.bankBranch || '',
      bankAccount: formData.bankAccount || '',
      requestType: formData.requestType || 'passages_per_diem',
    },
  });

  // Handle load profile - defined early so it can be used in useEffect
  const handleLoadProfile = useCallback(() => {
    if (!profile) return;

    // Set all form values from saved profile
    setValue('passengerName', profile.passengerName);
    setValue('passengerEmail', profile.passengerEmail);
    setValue('rg', profile.rg);
    setValue('rgIssuer', profile.rgIssuer);

    // Set masked CPF
    const cpfEvent = {
      target: { value: profile.cpf }
    } as React.ChangeEvent<HTMLInputElement>;
    cpfMask.handleChange(cpfEvent);
    setValue('cpf', cpfEvent.target.value);

    // Set birth date
    const date = new Date(profile.birthDate);
    setValue('birthDate', date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const dateEvent = {
      target: { value: formattedDate }
    } as React.ChangeEvent<HTMLInputElement>;
    dateMask.handleChange(dateEvent);

    // Set masked phone
    const phoneEvent = {
      target: { value: profile.phone }
    } as React.ChangeEvent<HTMLInputElement>;
    phoneMask.handleChange(phoneEvent);
    setValue('phone', phoneEvent.target.value);

    // Set bank details
    setValue('bankName', profile.bankName);
    setValue('bankBranch', profile.bankBranch);
    setValue('bankAccount', profile.bankAccount);

    toast.success('Perfil carregado com sucesso!');
  }, [profile, setValue, cpfMask, phoneMask, dateMask]);

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
    if (formData.birthDate) {
      // Format existing date to dd/mm/yyyy format
      const date = new Date(formData.birthDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const syntheticEvent = {
        target: { value: formattedDate }
      } as React.ChangeEvent<HTMLInputElement>;
      dateMask.handleChange(syntheticEvent);
    }
  }, [formData.cpf, formData.phone, formData.birthDate, cpfMask, phoneMask, dateMask, setValue]);

  // Auto-load profile if loadProfile=true query parameter is present
  useEffect(() => {
    const shouldLoadProfile = searchParams.get('loadProfile') === 'true';

    if (shouldLoadProfile && hasProfile && profile && !hasAutoLoaded) {
      // Small delay to ensure form is fully initialized
      const timer = setTimeout(() => {
        handleLoadProfile();
        setHasAutoLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, hasProfile, profile, hasAutoLoaded, handleLoadProfile]);


  const onSubmit = useCallback(async (data: PassengerData) => {
    // Convert Brazilian date format (dd/mm/yyyy) to ISO string
    let birthDateISO = '';
    if (data.birthDate instanceof Date) {
      birthDateISO = data.birthDate.toISOString();
    } else {
      // Parse from Brazilian format dd/mm/yyyy
      const dateValue = dateMask.value || '';
      const [day, month, year] = dateValue.split('/');
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        birthDateISO = date.toISOString();
      }
    }

    // Save data to store with raw values
    updateFormData({
      projectName: data.projectName,
      passengerName: data.passengerName,
      passengerEmail: data.passengerEmail,
      rg: data.rg,
      rgIssuer: data.rgIssuer,
      cpf: data.cpf.replace(/\D/g, ''), // Store raw CPF
      birthDate: birthDateISO,
      phone: data.phone.replace(/\D/g, ''), // Store raw phone
      bankDetails: data.bankDetails,
      // New structured bank fields
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankAccount: data.bankAccount,
      requestType: data.requestType,
    });

    // Don't call onNext here - navigation is handled by the parent after validation
    return true;
  }, [updateFormData, dateMask.value]);

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
    dateMask.handleChange(e);

    // Parse Brazilian format dd/mm/yyyy and convert to Date object
    const dateValue = e.target.value;
    const [day, month, year] = dateValue.split('/');

    if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setValue('birthDate', date);
        trigger('birthDate');
      }
    }
  };

  // Handle save profile
  const handleSaveProfile = useCallback(async () => {
    // Validate form first
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Por favor, corrija os erros no formulário antes de salvar o perfil.');
      return;
    }

    const formValues = getValues();

    // Convert date to ISO string
    let birthDateISO = '';
    if (formValues.birthDate instanceof Date) {
      birthDateISO = formValues.birthDate.toISOString();
    } else {
      const dateValue = dateMask.value || '';
      const [day, month, year] = dateValue.split('/');
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        birthDateISO = date.toISOString();
      }
    }

    // Save profile (excluding projectName and requestType)
    await saveProfile({
      passengerName: formValues.passengerName,
      passengerEmail: formValues.passengerEmail,
      rg: formValues.rg,
      rgIssuer: formValues.rgIssuer,
      cpf: formValues.cpf.replace(/\D/g, ''), // Store raw CPF
      birthDate: birthDateISO,
      phone: formValues.phone.replace(/\D/g, ''), // Store raw phone
      bankName: formValues.bankName,
      bankBranch: formValues.bankBranch,
      bankAccount: formValues.bankAccount,
    });
  }, [trigger, getValues, dateMask.value, saveProfile]);

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
            disabled={isValidating || isSubmitting || projectsLoading}
          >
            <SelectTrigger id="projectName">
              <SelectValue 
                placeholder={
                  projectsLoading 
                    ? "Carregando projetos..." 
                    : projectsError 
                      ? "Erro ao carregar projetos"
                      : projects.length === 0
                        ? "Nenhum projeto disponível"
                        : "Selecione o projeto"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span>Carregando projetos...</span>
                  </div>
                </div>
              ) : projectsError ? (
                <div className="px-3 py-3 text-sm">
                  <p className="text-red-600 mb-2">{projectsError}</p>
                  <button 
                    type="button"
                    onClick={() => {
                      clearProjectsError();
                      refetchProjects();
                    }}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-sm">
                  <span className="text-gray-500">Nenhum projeto disponível</span>
                </div>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.projectName && (
            <p className="text-sm text-red-500">{errors.projectName.message}</p>
          )}
          {projectsError && !projectsLoading && (
            <div className="flex items-center space-x-2 text-sm">
              <p className="text-red-500">Falha ao carregar projetos.</p>
              <button 
                type="button"
                onClick={() => {
                  clearProjectsError();
                  refetchProjects();
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Tentar novamente
              </button>
            </div>
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
            type="text"
            value={dateMask.value}
            onChange={handleDateChange}
            placeholder="dd/mm/yyyy"
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

        {/* Bank Details - Structured Fields */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Dados Bancários <span className="text-red-500">*</span>
          </Label>
          
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">
              Nome do Banco <span className="text-red-500">*</span>
            </Label>
            <BankSelect
              value={watch('bankName')}
              onValueChange={(value) => {
                setValue('bankName', value);
                trigger('bankName');
              }}
              placeholder="Selecione ou digite o nome do banco..."
              disabled={isValidating || isSubmitting}
              error={errors.bankName?.message}
            />
          </div>

          {/* Bank Branch */}
          <div className="space-y-2">
            <Label htmlFor="bankBranch">
              Agência <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankBranch"
              {...register('bankBranch')}
              placeholder="Ex: 1234, 1234-5"
              disabled={isValidating || isSubmitting}
            />
            {errors.bankBranch && (
              <p className="text-sm text-red-500">{errors.bankBranch.message}</p>
            )}
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label htmlFor="bankAccount">
              Conta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankAccount"
              {...register('bankAccount')}
              placeholder="Ex: 12345-6, 123456-7"
              disabled={isValidating || isSubmitting}
            />
            {errors.bankAccount && (
              <p className="text-sm text-red-500">{errors.bankAccount.message}</p>
            )}
          </div>
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

      {/* Profile Management Buttons - Bottom Left */}
      <div className="flex justify-start gap-3 pt-4 border-t border-slate-700/50">
        {hasProfile && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleLoadProfile}
            disabled={isValidating || isSubmitting}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Carregar Meu Perfil
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="default"
          onClick={handleSaveProfile}
          disabled={isValidating || isSubmitting || isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar como Meu Perfil'}
        </Button>
      </div>
    </form>
  );
});

PassengerDataPage.displayName = 'PassengerDataPage';