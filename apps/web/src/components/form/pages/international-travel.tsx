'use client';


import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AlertCircle } from 'lucide-react';
import { FileUploadZone } from '@/components/form/FileUploadZone';

export function InternationalTravelPage() {
  const { formData, updateFormData } = useFormStore();
  const { validationErrors, validateField } = useFormValidation();

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
    validateField(field, value);
  };

  const validatePassportExpiry = (date: string) => {
    if (!date || !formData.departureDate) return true;
    
    const expiryDate = new Date(date);
    const travelDate = new Date(formData.departureDate);
    const sixMonthsFromTravel = new Date(travelDate);
    sixMonthsFromTravel.setMonth(sixMonthsFromTravel.getMonth() + 6);
    
    return expiryDate >= sixMonthsFromTravel;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Internacional</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Informações adicionais para viagem internacional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passportNumber">Número do Passaporte *</Label>
          <Input
            id="passportNumber"
            value={formData.passportNumber || ''}
            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
            placeholder="AB123456"
            className={validationErrors.passportNumber ? 'border-red-500' : ''}
          />
          {validationErrors.passportNumber && (
            <p className="text-sm text-red-500">{validationErrors.passportNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportValidity">Validade do Passaporte *</Label>
          <Input
            id="passportValidity"
            type="date"
            value={typeof formData.passportValidity === 'string' ? formData.passportValidity : ''}
            onChange={(e) => handleInputChange('passportValidity', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={validationErrors.passportValidity ? 'border-red-500' : ''}
          />
          {validationErrors.passportValidity && (
            <p className="text-sm text-red-500">{validationErrors.passportValidity}</p>
          )}
          {formData.passportValidity && typeof formData.passportValidity === 'string' && !validatePassportExpiry(formData.passportValidity) && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Passaporte deve ser válido por pelo menos 6 meses a partir da data da viagem</p>
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visaRequired"
              checked={formData.visaRequired || false}
              onCheckedChange={(checked) => handleInputChange('visaRequired', checked)}
            />
            <Label htmlFor="visaRequired" className="font-normal">
              Visto necessário para o destino
            </Label>
          </div>
        </div>
      </div>

      {/* Passport Image Upload */}
      <div className="space-y-4">
        <div>
          <Label>Foto do Passaporte *</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Faça upload de uma foto clara da página principal do seu passaporte
          </p>
        </div>

        <FileUploadZone
          type="passport"
          multiple={false}
          maxFiles={1}
          onUploadComplete={(files) => {
            if (files.length > 0 && files[0].fileUrl) {
              updateFormData({ passportImageUrl: files[0].fileUrl });
            }
          }}
        />
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">
          <strong>Importante:</strong> Certifique-se de que seu passaporte tem validade mínima de 6 meses 
          a partir da data da viagem. Verifique também os requisitos de visto para o país de destino.
        </p>
      </div>
    </div>
  );
}