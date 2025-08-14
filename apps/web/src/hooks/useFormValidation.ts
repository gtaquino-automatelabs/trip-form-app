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

// Hook for form navigation with validation
export function useFormNavigation() {
  const {
    currentPage,
    visitedPages,
    setCurrentPage,
    markPageVisited,
    getNextAvailablePage,
    getPreviousAvailablePage,
    canNavigateToPage,
    formData
  } = useFormStore();
  
  const { validateCurrentPage } = useFormValidation();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToPage = useCallback(async (page: number): Promise<boolean> => {
    // Allow navigation to previously visited pages without validation
    if (visitedPages.includes(page)) {
      setCurrentPage(page);
      return true;
    }

    // Validate current page before moving forward
    if (page > currentPage) {
      setIsNavigating(true);
      try {
        const validation = await validateCurrentPage();
        
        if (!validation.isValid) {
          toast.error('Por favor, corrija os erros antes de continuar');
          return false;
        }
        
        // Mark current page as visited and navigate
        markPageVisited(currentPage);
        setCurrentPage(page);
        return true;
      } finally {
        setIsNavigating(false);
      }
    }

    // Allow backward navigation without validation
    setCurrentPage(page);
    return true;
  }, [currentPage, visitedPages, setCurrentPage, markPageVisited, validateCurrentPage]);

  const navigateNext = useCallback(async (): Promise<boolean> => {
    const nextPage = getNextAvailablePage();
    
    if (nextPage === currentPage) {
      toast.info('Você está na última página');
      return false;
    }
    
    return navigateToPage(nextPage);
  }, [currentPage, getNextAvailablePage, navigateToPage]);

  const navigatePrevious = useCallback(async (): Promise<boolean> => {
    const prevPage = getPreviousAvailablePage();
    
    if (prevPage === currentPage) {
      toast.info('Você está na primeira página');
      return false;
    }
    
    return navigateToPage(prevPage);
  }, [currentPage, getPreviousAvailablePage, navigateToPage]);

  const submitForm = useCallback(async (): Promise<boolean> => {
    setIsNavigating(true);
    
    try {
      // Validate current page first
      const validation = await validateCurrentPage();
      
      if (!validation.isValid) {
        toast.error('Por favor, corrija os erros antes de enviar');
        return false;
      }

      // Submit form to API
      const response = await fetch('/api/form/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erro ao enviar solicitação';
        
        if (errorData.details) {
          // Show validation errors
          const firstError = Object.values(errorData.details)[0];
          if (Array.isArray(firstError)) {
            toast.error(firstError[0]);
          } else {
            toast.error(firstError as string);
          }
        } else {
          toast.error(errorMessage);
        }
        return false;
      }

      const result = await response.json();
      
      // Store request info for confirmation page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('submissionResult', JSON.stringify({
          id: result.id,
          requestNumber: result.requestNumber
        }));
      }
      
      toast.success(result.message || 'Solicitação enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
      return false;
    } finally {
      setIsNavigating(false);
    }
  }, [validateCurrentPage, formData]);

  return {
    currentPage,
    visitedPages,
    isNavigating,
    navigateToPage,
    navigateNext,
    navigatePrevious,
    submitForm,
    canNavigateToPage
  };
}