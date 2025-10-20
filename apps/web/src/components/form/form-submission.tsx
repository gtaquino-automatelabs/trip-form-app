'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFormStore } from '@/stores/form-store';
import { validateFormDataForSubmission } from '@/schemas/travel-request';
import { toast } from 'sonner';

export function FormSubmission() {
  const router = useRouter();
  const {
    formData,
    isSubmitting,
    submissionProgress,
    submissionError,
    setSubmitting,
    setSubmissionProgress,
    setSubmissionError,
    setLastSubmissionId,
    uploadedFiles,
    getSubmissionToken
  } = useFormStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  const handleSubmit = async () => {
    try {
      // Reset any previous errors
      setValidationErrors(null);
      setSubmissionError(null);
      
      // Start submission
      setSubmitting(true);
      setSubmissionProgress(10);

      // Merge uploaded files data with form data
      const completeFormData = {
        ...formData,
        passportImageUrl: uploadedFiles.passport?.fileUrl,
        flightSuggestionFiles: uploadedFiles.flights
      };

      // Validate form data
      setSubmissionProgress(20);
      const validation = validateFormDataForSubmission(completeFormData);
      
      if (!validation.success) {
        setValidationErrors(validation.errors || null);
        toast.error('Por favor, corrija os erros no formulário antes de enviar.');
        setSubmitting(false);
        setSubmissionProgress(0);
        return;
      }

      // Prepare request
      setSubmissionProgress(40);
      
      // Get or generate idempotency token
      const submissionToken = getSubmissionToken();
      
      // Submit form with idempotency key
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': submissionToken,
        },
        body: JSON.stringify(completeFormData),
      });

      setSubmissionProgress(70);

      const result = await response.json();

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Preserve form data is already in localStorage thanks to auto-save
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        
        // Redirect to login with return URL
        setTimeout(() => {
          window.location.href = `/login?returnUrl=${encodeURIComponent('/form')}`;
        }, 2000);
        
        setSubmitting(false);
        setSubmissionProgress(0);
        return;
      }

      if (!response.ok) {
        // Check for validation errors
        if (result.error?.code === 'VALIDATION_ERROR' && result.error?.details) {
          setValidationErrors(result.error.details);
          
          // Scroll to first error field
          setTimeout(() => {
            const firstErrorField = document.querySelector('[aria-invalid="true"]');
            if (firstErrorField) {
              firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
        
        throw new Error(result.error?.message || 'Erro ao enviar formulário');
      }

      // Success
      setSubmissionProgress(100);
      setLastSubmissionId(result.data.requestId);
      
      // Show success message
      toast.success(result.data.message);
      
      // Redirect to confirmation page (don't clear form data yet - confirmation page will handle it)
      setTimeout(() => {
        router.push(`/confirmation?requestId=${result.data.requestId}`);
      }, 1000);

    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao enviar formulário';
      
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
      
      setSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  // Check if form is ready for submission
  const isFormComplete = () => {
    // Basic required fields check
    const requiredFields = [
      'projectName',
      'passengerName',
      'passengerEmail',
      'rg',
      'rgIssuer',
      'cpf',
      'birthDate',
      'phone',
      'bankName',     // New structured bank fields
      'bankBranch',   // New structured bank fields
      'bankAccount',  // New structured bank fields
      'requestType',
      'origin',
      'destination',
      'departureDate',
      'returnDate',
      'transportType',
      'tripObjective'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        return false;
      }
    }

    // Check conditional fields
    if (formData.isInternational) {
      if (!formData.passportNumber || !formData.passportValidity) {
        return false;
      }
    }

    if (formData.hasTimeRestrictions && !formData.timeRestrictionDetails) {
      return false;
    }

    if (formData.isUrgent && !formData.urgentJustification) {
      return false;
    }

    if (formData.expenseTypes?.includes('other') && !formData.otherExpenseDescription) {
      return false;
    }

    return true;
  };

  const canSubmit = !isSubmitting && isFormComplete();

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {isSubmitting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Enviando formulário...</span>
            <span>{submissionProgress}%</span>
          </div>
          <Progress value={submissionProgress} className="h-2" />
        </div>
      )}

      {/* Validation errors */}
      {validationErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Erros de validação encontrados:</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <li key={field}>
                    <span className="font-medium">{field}:</span> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submission error */}
      {submissionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erro ao enviar formulário:</p>
              <p>{submissionError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Enviar Solicitação
          </>
        )}
      </Button>

      {/* Helper text */}
      {!isFormComplete() && !isSubmitting && (
        <p className="text-sm text-muted-foreground text-center">
          Por favor, preencha todos os campos obrigatórios antes de enviar.
        </p>
      )}
    </div>
  );
}