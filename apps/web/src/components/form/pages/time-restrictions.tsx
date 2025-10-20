'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/form-store';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useFormValidation } from '@/hooks/useFormValidation';

export function TimeRestrictionsPage() {
  const { formData, updateFormData } = useFormStore();
  const { validationErrors, validateField } = useFormValidation();
  const [commonRestrictions, setCommonRestrictions] = useState({
    directFlights: false,
    avoidNightFlights: false,
    arriveBeforeTime: false,
    departAfterTime: false,
  });
  const [arriveBeforeTime, setArriveBeforeTime] = useState('');
  const [departAfterTime, setDepartAfterTime] = useState('');
  
  const restrictionText = formData.timeRestrictionDetails || '';
  const minCharacters = 20;
  const characterCount = restrictionText.length;

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
    validateField(field, value);
  };

  const handleCommonRestrictionChange = (restriction: string, checked: boolean) => {
    setCommonRestrictions(prev => ({ ...prev, [restriction]: checked }));
    updateTextareaFromSelections({ ...commonRestrictions, [restriction]: checked });
  };

  const updateTextareaFromSelections = (restrictions: typeof commonRestrictions) => {
    const selectedOptions = [];
    
    if (restrictions.directFlights) {
      selectedOptions.push('Prefiro voos diretos');
    }
    if (restrictions.avoidNightFlights) {
      selectedOptions.push('Evitar voos noturnos');
    }
    if (restrictions.arriveBeforeTime && arriveBeforeTime) {
      selectedOptions.push(`Necessito chegar antes de ${arriveBeforeTime}`);
    }
    if (restrictions.departAfterTime && departAfterTime) {
      selectedOptions.push(`Necessito partir após ${departAfterTime}`);
    }

    if (selectedOptions.length > 0) {
      const newText = selectedOptions.join('. ') + (restrictionText && !selectedOptions.some(opt => restrictionText.includes(opt.split(' ')[0])) ? '. ' + restrictionText : '');
      handleInputChange('timeRestrictionDetails', newText);
    }
  };

  const handleTimeChange = (type: 'arrive' | 'depart', time: string) => {
    if (type === 'arrive') {
      setArriveBeforeTime(time);
      if (commonRestrictions.arriveBeforeTime) {
        updateTextareaFromSelections(commonRestrictions);
      }
    } else {
      setDepartAfterTime(time);
      if (commonRestrictions.departAfterTime) {
        updateTextareaFromSelections(commonRestrictions);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Restrições de Horário</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Informe suas restrições de horário para a viagem
        </p>
      </div>

      {/* Common Restriction Options */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Opções Comuns de Restrição</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Selecione as opções que se aplicam (opcional)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="directFlights"
                checked={commonRestrictions.directFlights}
                onCheckedChange={(checked) => handleCommonRestrictionChange('directFlights', checked as boolean)}
              />
              <Label htmlFor="directFlights" className="font-normal">
                Prefiro voos diretos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidNightFlights"
                checked={commonRestrictions.avoidNightFlights}
                onCheckedChange={(checked) => handleCommonRestrictionChange('avoidNightFlights', checked as boolean)}
              />
              <Label htmlFor="avoidNightFlights" className="font-normal">
                Evitar voos noturnos
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="arriveBeforeTime"
                  checked={commonRestrictions.arriveBeforeTime}
                  onCheckedChange={(checked) => handleCommonRestrictionChange('arriveBeforeTime', checked as boolean)}
                />
                <Label htmlFor="arriveBeforeTime" className="font-normal">
                  Necessito chegar antes de:
                </Label>
              </div>
              {commonRestrictions.arriveBeforeTime && (
                <Input
                  type="time"
                  value={arriveBeforeTime}
                  onChange={(e) => handleTimeChange('arrive', e.target.value)}
                  className="ml-6 w-32"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="departAfterTime"
                  checked={commonRestrictions.departAfterTime}
                  onCheckedChange={(checked) => handleCommonRestrictionChange('departAfterTime', checked as boolean)}
                />
                <Label htmlFor="departAfterTime" className="font-normal">
                  Necessito partir após:
                </Label>
              </div>
              {commonRestrictions.departAfterTime && (
                <Input
                  type="time"
                  value={departAfterTime}
                  onChange={(e) => handleTimeChange('depart', e.target.value)}
                  className="ml-6 w-32"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Restrictions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timeRestrictionDetails">Detalhes das Restrições *</Label>
          <Textarea
            id="timeRestrictionDetails"
            value={restrictionText}
            onChange={(e) => handleInputChange('timeRestrictionDetails', e.target.value)}
            placeholder="Descreva suas restrições de horário para voos... (mínimo 20 caracteres)"
            rows={6}
            className={validationErrors.timeRestrictionDetails ? 'border-red-500' : ''}
          />
          
          <div className="flex justify-between items-center text-sm">
            <div>
              {validationErrors.timeRestrictionDetails && (
                <p className="text-red-500">{validationErrors.timeRestrictionDetails}</p>
              )}
            </div>
            <div className={`${characterCount < minCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount}/{minCharacters} caracteres mínimos
            </div>
          </div>
          
          {characterCount < minCharacters && (
            <p className="text-sm text-amber-600">
              Por favor, forneça mais detalhes sobre suas restrições de horário.
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> Seja específico sobre horários de chegada e partida necessários, 
          compromissos que precisa atender, ou qualquer outra restrição temporal que possa afetar 
          a escolha dos voos ou transportes.
        </p>
      </div>
    </div>
  );
}