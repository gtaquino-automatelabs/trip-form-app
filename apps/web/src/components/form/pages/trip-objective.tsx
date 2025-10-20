'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/form-store';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ReviewSummary } from '@/components/form/review-summary';

export function TripObjectivePage() {
  const { formData, updateFormData } = useFormStore();
  const { validationErrors, validateField } = useFormValidation();
  const [characterCount, setCharacterCount] = useState(formData.tripObjective?.length || 0);
  const [urgentCharacterCount, setUrgentCharacterCount] = useState(formData.urgentJustification?.length || 0);

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
    validateField(field, value);
    
    if (field === 'tripObjective') {
      setCharacterCount(value?.length || 0);
    }
    if (field === 'urgentJustification') {
      setUrgentCharacterCount(value?.length || 0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Objetivo da Viagem</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Forneça a justificativa da viagem e revise todas as informações antes de enviar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tripObjective">Objetivo da Viagem *</Label>
            <Textarea
              id="tripObjective"
              value={formData.tripObjective || ''}
              onChange={(e) => handleInputChange('tripObjective', e.target.value)}
              placeholder="Descreva o objetivo desta viagem..."
              rows={5}
              className={`min-h-[120px] ${
                validationErrors.tripObjective ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {characterCount}/50 caracteres (mínimo 50)
              </p>
              {validationErrors.tripObjective && (
                <p className="text-sm text-red-500">{validationErrors.tripObjective}</p>
              )}
            </div>
            {characterCount < 50 && characterCount > 0 && (
              <p className="text-sm text-yellow-600">
                Por favor, forneça mais detalhes sobre o objetivo da viagem.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações Adicionais</Label>
            <Textarea
              id="observations"
              value={formData.observations || ''}
              onChange={(e) => handleInputChange('observations', e.target.value.slice(0, 500))}
              placeholder="Informações adicionais relevantes (opcional)"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              {formData.observations?.length || 0}/500 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <Label htmlFor="isUrgent" className="font-medium cursor-pointer">
                Solicitação Urgente?
              </Label>
              <Checkbox
                id="isUrgent"
                checked={formData.isUrgent || false}
                onCheckedChange={(checked) => handleInputChange('isUrgent', checked)}
              />
            </div>
            {formData.isUrgent && (
              <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Solicitações urgentes requerem justificativa detalhada
                </p>
              </div>
            )}
          </div>

          {formData.isUrgent && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label htmlFor="urgentJustification">Justificativa da Urgência *</Label>
              <Textarea
                id="urgentJustification"
                value={formData.urgentJustification || ''}
                onChange={(e) => handleInputChange('urgentJustification', e.target.value)}
                placeholder="Explique detalhadamente o motivo da urgência..."
                rows={3}
                className={`${
                  validationErrors.urgentJustification ? 'border-red-500' : ''
                }`}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {urgentCharacterCount}/30 caracteres (mínimo 30)
                </p>
                {validationErrors.urgentJustification && (
                  <p className="text-sm text-red-500">{validationErrors.urgentJustification}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review Summary Section */}
        <div className="lg:col-span-1">
          <ReviewSummary />
        </div>
      </div>

    </div>
  );
}