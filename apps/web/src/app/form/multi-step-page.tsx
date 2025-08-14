'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormLayout } from '@/components/form/form-layout';
import { useFormStore } from '@/stores/form-store';
import { useFormNavigation } from '@/hooks/useFormValidation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { RecoveryPrompt } from '@/components/ui/recovery-prompt';
import { ErrorBoundary } from '@/components/error-boundary';
import { logUserAction } from '@/lib/error-logger';
import { toast } from 'sonner';
import {
  PassengerDataPage,
  TravelDetailsPage,
  ExpenseTypesPage,
  PreferencesPage,
  InternationalTravelPage,
  TimeRestrictionsPage,
  FlightPreferencesPage,
  TripObjectivePage,
  type PassengerDataPageRef
} from '@/components/form/pages';

const formPages = [
  PassengerDataPage,
  TravelDetailsPage,
  ExpenseTypesPage,
  PreferencesPage,
  InternationalTravelPage,
  TimeRestrictionsPage,
  FlightPreferencesPage,
  TripObjectivePage
];

export default function MultiStepFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageRefs = useRef<Record<number, any>>({});
  
  const {
    currentPage,
    visitedPages,
    isNavigating,
    navigateNext,
    navigatePrevious,
    navigateToPage,
    submitForm
  } = useFormNavigation();
  
  const { formData, clearFormData, hasRecoverableData } = useFormStore();
  
  // Enable auto-save
  useAutoSave({
    enabled: true,
    interval: 30000,
    showNotification: false,
  });
  
  // Monitor network status
  const { isOnline } = useNetworkStatus();

  // Sync URL with current page
  useEffect(() => {
    const urlPage = searchParams.get('page');
    const pageNumber = urlPage ? parseInt(urlPage, 10) : 1;
    
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= 8) {
      navigateToPage(pageNumber);
    }
  }, [searchParams, currentPage, navigateToPage]);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', currentPage.toString());
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentPage, searchParams]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlPage = new URLSearchParams(window.location.search).get('page');
      const pageNumber = urlPage ? parseInt(urlPage, 10) : 1;
      
      if (pageNumber !== currentPage && visitedPages.includes(pageNumber)) {
        navigateToPage(pageNumber);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, visitedPages, navigateToPage]);

  // Warn about unsaved changes
  useEffect(() => {
    const hasFormData = Object.keys(formData).some(key => {
      const value = formData[key as keyof typeof formData];
      return value !== undefined && value !== '' && value !== false && 
             (Array.isArray(value) ? value.length > 0 : true);
    });

    if (!hasFormData || isSubmitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, isSubmitting]);

  const handlePrevious = useCallback(async () => {
    logUserAction('navigate_previous', { fromPage: currentPage });
    await navigatePrevious();
  }, [navigatePrevious, currentPage]);

  const handleNext = useCallback(async () => {
    // If current page has validation, use it
    const currentPageRef = pageRefs.current[currentPage];
    if (currentPageRef?.validate) {
      const isValid = await currentPageRef.validate();
      if (!isValid) {
        toast.error('Por favor, corrija os erros antes de continuar');
        logUserAction('validation_failed', { page: currentPage });
        return;
      }
    }
    logUserAction('navigate_next', { fromPage: currentPage });
    await navigateNext();
  }, [navigateNext, currentPage]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = useCallback(async () => {
    // Show confirmation dialog first
    if (!showConfirmDialog) {
      const confirmMessage = formData.isUrgent 
        ? 'Você está prestes a enviar uma solicitação URGENTE. Confirma o envio?'
        : 'Você está prestes a enviar sua solicitação de viagem. Confirma o envio?';
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    // Prevent double submission
    if (isSubmitting) {
      toast.warning('Solicitação já está sendo processada...');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate current page before submitting
      const currentPageRef = pageRefs.current[currentPage];
      if (currentPageRef?.validate) {
        const isValid = await currentPageRef.validate();
        if (!isValid) {
          toast.error('Por favor, corrija os erros antes de enviar');
          setIsSubmitting(false);
          return;
        }
      }
      
      const success = await submitForm();
      
      if (success) {
        // Get submission result from sessionStorage
        const resultStr = sessionStorage.getItem('submissionResult');
        const result = resultStr ? JSON.parse(resultStr) : null;
        
        // Clear form data and redirect
        clearFormData();
        
        if (result?.id && result?.requestNumber) {
          router.push(`/confirmation/${result.id}?requestNumber=${result.requestNumber}`);
        } else {
          router.push('/my-requests');
        }
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('Erro ao enviar solicitação');
      setIsSubmitting(false);
    }
  }, [submitForm, clearFormData, router, currentPage, isSubmitting, formData.isUrgent, showConfirmDialog]);

  // Get the current page component
  const CurrentPageComponent = formPages[currentPage - 1];

  // Determine if we should show the page
  const shouldShowPage = () => {
    if (currentPage === 5 && !formData.isInternational) return false;
    if (currentPage === 6 && !formData.hasTimeRestrictions) return false;
    if (currentPage === 7 && !formData.hasFlightPreferences) return false;
    return true;
  };

  const showPage = shouldShowPage();

  // Auto-navigate to next available page if current page shouldn't be shown
  useEffect(() => {
    if (!showPage) {
      navigateNext();
    }
  }, [showPage, navigateNext]);

  if (!showPage) {
    return null;
  }

  return (
    <ErrorBoundary>
      <>
        {/* Offline Banner */}
        <OfflineBanner />
        
        {/* Recovery Prompt */}
        {hasRecoverableData && (
          <RecoveryPrompt 
            onRecover={() => {
              logUserAction('form_data_recovered');
              toast.success('Dados do formulário recuperados com sucesso!');
            }}
            onDiscard={() => {
              logUserAction('form_data_discarded');
            }}
          />
        )}
        
        <FormLayout
          currentStep={currentPage}
          totalSteps={8}
          visitedPages={visitedPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onNavigateToPage={navigateToPage}
          isPreviousDisabled={currentPage === 1 || isNavigating || isSubmitting}
          isNextDisabled={isNavigating || isSubmitting || !isOnline}
          isLoading={isNavigating || isSubmitting}
        >
          <CurrentPageComponent 
            ref={(ref) => { 
              if (ref) {
                pageRefs.current[currentPage] = ref;
              }
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </FormLayout>
      </>
    </ErrorBoundary>
  );
}