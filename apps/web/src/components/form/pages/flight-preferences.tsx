'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFormValidation } from '@/hooks/useFormValidation';
import { X, Plus } from 'lucide-react';
import { FileUploadZone } from '@/components/form/FileUploadZone';
import { FilePreview } from '@/components/form/FilePreview';

export function FlightPreferencesPage() {
  const { formData, updateFormData } = useFormStore();
  const { validationErrors } = useFormValidation();
  const [newUrl, setNewUrl] = useState('');

  const handleAddUrl = () => {
    if (newUrl && isValidUrl(newUrl)) {
      const currentUrls = formData.flightSuggestionUrls || [];
      updateFormData({ flightSuggestionUrls: [...currentUrls, newUrl] });
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (index: number) => {
    const currentUrls = formData.flightSuggestionUrls || [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    updateFormData({ flightSuggestionUrls: newUrls });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  const handlePreferencesChange = (value: string) => {
    updateFormData({ flightPreferences: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Preferências de Voo</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Adicione documentos com sugestões de voos ou descreva suas preferências
        </p>
      </div>

      {/* Flight Preferences Text */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="flightPreferences">Observações sobre preferências de voo</Label>
          <Textarea
            id="flightPreferences"
            value={formData.flightPreferences || ''}
            onChange={(e) => handlePreferencesChange(e.target.value)}
            placeholder="Descreva suas preferências de voo: companhias aéreas favoritas, horários preferidos, necessidades especiais, etc."
            rows={4}
            className={validationErrors.flightPreferences ? 'border-red-500' : ''}
          />
          {validationErrors.flightPreferences && (
            <p className="text-sm text-red-500">{validationErrors.flightPreferences}</p>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <div>
          <Label>Documentos de Sugestão de Voos</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Faça upload de documentos com sugestões específicas de voos (máximo 3 arquivos, 10MB cada)
          </p>
        </div>

        <FileUploadZone
          type="flight"
          multiple={true}
          maxFiles={3}
        />

        {/* Display uploaded files using FilePreview */}
        {formData.flightSuggestionFiles && formData.flightSuggestionFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Arquivos Enviados:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.flightSuggestionFiles.map((file, index) => (
                <FilePreview
                  key={index}
                  fileName={file.fileName}
                  fileUrl={file.fileUrl}
                  fileSize={file.fileSize}
                  fileType={file.fileType}
                  onRemove={() => {
                    const newFiles = formData.flightSuggestionFiles?.filter((_, i) => i !== index) || [];
                    updateFormData({ flightSuggestionFiles: newFiles });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* URL Section (kept for compatibility) */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="flightUrl">Links de Sugestão de Voos (opcional)</Label>
          <div className="flex gap-2">
            <Input
              id="flightUrl"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://exemplo.com/voo"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddUrl}
              disabled={!newUrl || !isValidUrl(newUrl)}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {(formData.flightSuggestionUrls || []).length > 0 && (
          <div className="space-y-2">
            <Label>Links Adicionados:</Label>
            <div className="space-y-2">
              {(formData.flightSuggestionUrls || []).map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveUrl(index)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>Dica:</strong> Você pode adicionar documentos com sugestões de voos ou links de sites de companhias aéreas. 
          Use o campo de observações para descrever suas preferências sem anexar arquivos.
        </p>
      </div>
    </div>
  );
}