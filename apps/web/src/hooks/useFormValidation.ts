import { useState, useCallback } from 'react';
import { useFormStore } from '@/stores/form-store';
import { validatePageData } from '@/schemas/form-validation';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function useFormValidation() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  const { formData, currentPage } = useFormStore();

  const validateCurrentPage = useCallback(async (): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      // Skip validation for conditional pages if they're not active
      if (currentPage === 5 && !formData.isInternational) {
        setValidationErrors({});
        return { isValid: true, errors: {} };
      }
      
      if (currentPage === 6 && !formData.hasTimeRestrictions) {
        setValidationErrors({});
        return { isValid: true, errors: {} };
      }
      
      if (currentPage === 7 && !formData.hasFlightPreferences) {
        setValidationErrors({});
        return { isValid: true, errors: {} };
      }

      // Ensure formData has default values for the current page
      const safeFormData = {
        ...formData,
        // Provide defaults for array fields
        expenseTypes: formData.expenseTypes || [],
        flightSuggestionUrls: formData.flightSuggestionUrls || []
      };

      const result = validatePageData(currentPage, safeFormData);
      
      if (!result.success) {
        setValidationErrors(result.errors);
        
        // Show first error as toast
        const firstError = Object.values(result.errors)[0];
        if (firstError) {
          toast.error(firstError);
        }
        
        // Debug log for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Validation failed:', {
            page: currentPage,
            errors: result.errors,
            formData: safeFormData
          });
        }
        
        return { isValid: false, errors: result.errors };
      }
      
      setValidationErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      console.error('Validation error:', error);
      const errorMessage = 'Erro ao validar o formulário';
      setValidationErrors({ general: errorMessage });
      toast.error(errorMessage);
      return { isValid: false, errors: { general: errorMessage } };
    } finally {
      setIsValidating(false);
    }
  }, [currentPage, formData]);

  const validateField = useCallback((fieldName: string, value: any): string | undefined => {
    // Create a partial object with just the field to validate
    const partialData = { ...formData, [fieldName]: value };
    const result = validatePageData(currentPage, partialData);
    
    if (!result.success && result.errors[fieldName]) {
      return result.errors[fieldName];
    }
    
    return undefined;
  }, [currentPage, formData]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    validationErrors,
    isValidating,
    validateCurrentPage,
    validateField,
    clearValidationErrors,
    setFieldError,
    clearFieldError
  };
}

