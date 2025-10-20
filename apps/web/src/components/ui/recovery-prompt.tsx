'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormStore } from '@/stores/form-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecoveryPromptProps {
  onRecover?: () => void;
  onDiscard?: () => void;
}

export function RecoveryPrompt({ onRecover, onDiscard }: RecoveryPromptProps) {
  const {
    hasRecoverableData,
    lastAutoSave,
    recoverFormData,
    clearFormData,
    setHasRecoverableData
  } = useFormStore();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(hasRecoverableData);
  }, [hasRecoverableData]);

  const handleRecover = () => {
    recoverFormData();
    onRecover?.();
    setIsVisible(false);
  };

  const handleDiscard = () => {
    // Clear auto-save data
    localStorage.removeItem('travelForm_autoSave');
    clearFormData();
    setHasRecoverableData(false);
    onDiscard?.();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const formattedDate = lastAutoSave
    ? format(new Date(lastAutoSave), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : 'data desconhecida';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <RefreshCcw className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Recuperar Formulário
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Encontramos dados salvos automaticamente de {formattedDate}.
              Deseja recuperar seu progresso?
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Se você escolher &ldquo;Começar do zero&rdquo;, os dados salvos serão perdidos permanentemente.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleRecover}
            className="flex-1"
            variant="default"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Recuperar Formulário
          </Button>
          <Button
            onClick={handleDiscard}
            className="flex-1"
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            Começar do Zero
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecoveryPrompt;