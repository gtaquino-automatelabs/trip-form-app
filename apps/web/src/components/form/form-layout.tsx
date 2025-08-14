'use client';

import type { ReactNode } from 'react';
import { ProgressBar } from './progress-bar';
import { Navigation } from './navigation';
import { BreadcrumbNav } from './breadcrumb-nav';

interface FormLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  visitedPages?: number[];
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  onNavigateToPage?: (page: number) => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export function FormLayout({ 
  children,
  currentStep = 1,
  totalSteps = 8,
  visitedPages = [1],
  onPrevious,
  onNext,
  onSubmit,
  onNavigateToPage,
  isPreviousDisabled,
  isNextDisabled,
  isLoading
}: FormLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image Layer */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content Container */}
        <main className="flex-1 container mx-auto px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Form Card - Responsive margins and padding */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl">
              {/* Progress Section with ProgressBar and Breadcrumb */}
              <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Solicitação de Viagem
                </h2>
                
                {/* Breadcrumb Navigation */}
                {onNavigateToPage && (
                  <BreadcrumbNav
                    currentStep={currentStep}
                    visitedPages={visitedPages}
                    onNavigate={onNavigateToPage}
                    className="mb-4"
                  />
                )}
                
                {/* Progress Bar */}
                <ProgressBar 
                  currentStep={currentStep} 
                  totalSteps={totalSteps} 
                />
              </div>

              {/* Form Content - Responsive padding for all breakpoints */}
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                {children}
              </div>

              {/* Navigation Section */}
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                <Navigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPrevious={onPrevious}
                  onNext={onNext}
                  onSubmit={onSubmit}
                  isPreviousDisabled={isPreviousDisabled}
                  isNextDisabled={isNextDisabled}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}