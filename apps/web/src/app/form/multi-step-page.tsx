'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormLayout } from '@/components/form/form-layout';
import { useFormStore } from '@/stores/form-store';
import { useFormNavigation } from '@/hooks/useFormNavigation';
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
  const pageRefs = useRef<Record<number, PassengerDataPageRef> & { previousPage?: number }>({});
  
  const {
    currentPage,
    visitedPages,
    isNavigating,
    navigateNext,
    navigatePrevious,
    navigateToPage,
    submitForm,
    registerPageValidator,
    unregisterPageValidator
  } = useFormNavigation();
  
  // Helper to register page validator
  const handlePageRef = useCallback((page: number) => (ref: PassengerDataPageRef | null) => {
    if (ref) {
      pageRefs.current[page] = ref;
      // Register validator if component has one
      if (ref.validate) {
        registerPageValidator(page, ref.validate);
      }
    } else {
      // Cleanup when component unmounts
      delete pageRefs.current[page];
      unregisterPageValidator(page);
    }
  }, [registerPageValidator, unregisterPageValidator]);
  
  const { formData, clearFormData, hasRecoverableData } = useFormStore();
  
  // Enable auto-save
  useAutoSave({
    enabled: true,
    interval: 30000,
    showNotification: false,
  });
  
  // Monitor network status
  const { isOnline } = useNetworkStatus();
  
  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Sync URL with current page (one-way only to avoid loops)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const urlPage = params.get('page');
    const urlPageNumber = urlPage ? parseInt(urlPage, 10) : 1;
    
    // Only update URL if it differs from current page
    if (urlPageNumber !== currentPage) {
      params.set('page', currentPage.toString());
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
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
      return 'Você tem alterações não salvas. Tem certeza que deseja sair?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, isSubmitting]);

  const handlePrevious = useCallback(async () => {
    logUserAction('navigate_previous', { fromPage: currentPage });
    await navigatePrevious();
  }, [navigatePrevious, currentPage]);

  const handleNext = useCallback(async () => {
    console.log('🔄 handleNext called - currentPage:', currentPage);
    
    // Use unified navigation system
    logUserAction('navigate_next', { fromPage: currentPage });
    const result = await navigateNext();
    console.log('🎯 NavigateNext result:', result);
  }, [navigateNext, currentPage]);

  const handleSubmit = useCallback(async () => {
    // Prevent double submission first
    if (isSubmitting || isNavigating) {
      toast.warning('Solicitação já está sendo processada...');
      return;
    }
    
    // Show confirmation dialog
    const confirmMessage = formData.isUrgent 
      ? 'Você está prestes a enviar uma solicitação URGENTE. Confirma o envio?'
      : 'Você está prestes a enviar sua solicitação de viagem. Confirma o envio?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);

    try {
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
  }, [submitForm, clearFormData, router, isSubmitting, formData.isUrgent, isNavigating]);

  // Get the current page component - with validation
  const pageIndex = currentPage - 1;
  const CurrentPageComponent = formPages[pageIndex];
  
  // Ensure we have a valid component
  if (!CurrentPageComponent) {
    console.error(`No component found for page ${currentPage} at index ${pageIndex}`);
  }

  // Determine if we should show the page
  const shouldShowPage = () => {
    if (currentPage === 5 && !formData.isInternational) return false;
    if (currentPage === 6 && !formData.hasTimeRestrictions) return false;
    if (currentPage === 7 && !formData.hasFlightPreferences) return false;
    return true;
  };

  const showPage = shouldShowPage();
  
  // Debug logging
  useEffect(() => {
    console.log('🔄 PAGE STATE CHANGED:', {
      currentPage,
      previousPage: pageRefs.current.previousPage || 'none',
      componentName: CurrentPageComponent?.name || 'UNDEFINED',
      componentExists: !!CurrentPageComponent,
      showPage,
      shouldRenderContent: showPage && CurrentPageComponent,
      visitedPages,
      allPages: formPages.map((p, i) => `${i+1}: ${p.name}`)
    });
    // Store previous page for debugging
    pageRefs.current.previousPage = currentPage;
  }, [currentPage, showPage, visitedPages, CurrentPageComponent]);

  // Auto-navigate to next available page if current page shouldn't be shown
  useEffect(() => {
    if (!showPage && !isNavigating) {
      // Use a timeout to avoid synchronous state updates that can cause infinite loops
      const timer = setTimeout(() => {
        // Only navigate if we haven't already tried navigating
        console.log('⏭️ Auto-navigating from conditional page:', currentPage);
        navigateNext();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPage, isNavigating, currentPage, navigateNext]);

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
        
        {/* Only render form if page should be shown */}
        {showPage && (
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
            {/* Force re-render by using dynamic component rendering */}
            {currentPage === 1 && (
              <PassengerDataPage ref={handlePageRef(1)} />
            )}
            {currentPage === 2 && (
              <TravelDetailsPage ref={handlePageRef(2)} />
            )}
            {currentPage === 3 && (
              <ExpenseTypesPage ref={handlePageRef(3)} />
            )}
            {currentPage === 4 && (
              <PreferencesPage ref={handlePageRef(4)} />
            )}
            {currentPage === 5 && (
              <InternationalTravelPage
              />
            )}
            {currentPage === 6 && (
              <TimeRestrictionsPage
              />
            )}
            {currentPage === 7 && (
              <FlightPreferencesPage
              />
            )}
            {currentPage === 8 && (
              <TripObjectivePage
              />
            )}
          </FormLayout>
        )}
        
        {/* Error fallback if component is missing */}
        {showPage && !CurrentPageComponent && (
          <div className="p-8 text-center">
            <p className="text-red-500">Erro: Página {currentPage} não encontrada</p>
          </div>
        )}
      </>
    </ErrorBoundary>
  );
}