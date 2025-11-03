import { useState, useCallback, useRef } from 'react';
import { useFormStore } from '@/stores/form-store';
import { useFormValidation } from './useFormValidation';
import { toast } from 'sonner';

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
  
  // Registry for component-level validation functions
  const componentValidators = useRef<Record<number, () => Promise<boolean>>>({});

  const registerPageValidator = useCallback((page: number, validator: () => Promise<boolean>) => {
    componentValidators.current[page] = validator;
  }, []);

  const unregisterPageValidator = useCallback((page: number) => {
    delete componentValidators.current[page];
  }, []);

  const navigateToPage = useCallback(async (page: number): Promise<boolean> => {
    // Prevent navigation to the same page
    if (page === currentPage) {
      return false;
    }
    
    // Allow navigation to previously visited pages without validation
    if (visitedPages.includes(page)) {
      setCurrentPage(page);
      return true;
    }

    // Validate current page before moving forward
    if (page > currentPage) {
      setIsNavigating(true);
      try {
        let isValid = false;

        // Try component-level validation first (preferred)
        const componentValidator = componentValidators.current[currentPage];
        if (componentValidator) {
          isValid = await componentValidator();
        } else {
          const validation = await validateCurrentPage();
          isValid = validation.isValid;
        }

        if (!isValid) {
          toast.error('Por favor, corrija os erros antes de continuar');
          return false;
        }

        // Mark current page as visited BEFORE navigating
        markPageVisited(currentPage);

        // Now mark the target page as visited if navigating sequentially
        if (page === currentPage + 1 || page > currentPage) {
          markPageVisited(page);
        }

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
    // Prevent multiple simultaneous navigation attempts
    if (isNavigating) {
      return false;
    }

    const nextPage = getNextAvailablePage();

    if (nextPage === currentPage) {
      if (currentPage === 8 || nextPage === 8) {
        // We're on the last page, don't show a toast
        return false;
      }
      toast.info('Você está na última página disponível');
      return false;
    }

    const result = await navigateToPage(nextPage);
    return result;
  }, [currentPage, getNextAvailablePage, navigateToPage, visitedPages, formData, isNavigating]);

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
      // Validate current page first using preferred method
      let isValid = false;

      // Try component-level validation first (preferred)
      const componentValidator = componentValidators.current[currentPage];
      if (componentValidator) {
        isValid = await componentValidator();
      } else {
        const validation = await validateCurrentPage();
        isValid = validation.isValid;
      }

      if (!isValid) {
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
  }, [validateCurrentPage, formData, currentPage]);

  return {
    currentPage,
    visitedPages,
    isNavigating,
    navigateToPage,
    navigateNext,
    navigatePrevious,
    submitForm,
    canNavigateToPage,
    registerPageValidator,
    unregisterPageValidator
  };
}
