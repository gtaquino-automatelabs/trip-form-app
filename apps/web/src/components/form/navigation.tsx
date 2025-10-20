'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentStep: number;
  totalSteps?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function Navigation({
  currentStep,
  totalSteps = 8,
  onPrevious,
  onNext,
  onSubmit,
  isPreviousDisabled = false,
  isNextDisabled = false,
  isLoading = false,
  className
}: NavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={cn('flex justify-between items-center gap-4', className)}>
      {/* Previous Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isPreviousDisabled || isLoading}
        className="min-w-[120px] sm:min-w-[140px]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
        <span className="sm:hidden">Voltar</span>
      </Button>

      {/* Step Counter for Mobile */}
      <div className="sm:hidden text-sm text-gray-600 font-medium">
        {currentStep}/{totalSteps}
      </div>

      {/* Next/Submit Button */}
      <Button
        type="button"
        variant={isLastStep ? "default" : "default"}
        onClick={isLastStep ? onSubmit : onNext}
        disabled={isNextDisabled || isLoading}
        className={cn(
          "min-w-[120px] sm:min-w-[180px]",
          isLastStep && "bg-green-600 hover:bg-green-700 text-white"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Processando</span>
            <span className="sm:hidden">...</span>
          </>
        ) : isLastStep ? (
          <>
            <span className="hidden sm:inline">Enviar Solicitação</span>
            <span className="sm:hidden">Enviar</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Próximo</span>
            <span className="sm:hidden">Avançar</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

interface QuickNavigationProps {
  currentStep: number;
  totalSteps?: number;
  visitedPages: number[];
  onNavigate: (step: number) => void;
  className?: string;
}

export function QuickNavigation({
  currentStep,
  totalSteps = 8,
  visitedPages,
  onNavigate,
  className
}: QuickNavigationProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isVisited = visitedPages.includes(stepNumber);
        const isCurrent = stepNumber === currentStep;
        const canNavigate = isVisited && !isCurrent;

        return (
          <button
            key={stepNumber}
            onClick={() => canNavigate && onNavigate(stepNumber)}
            disabled={!canNavigate}
            className={cn(
              'w-8 h-8 rounded-full text-xs font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer focus:ring-blue-500': canNavigate,
                'bg-blue-600 text-white cursor-default': isCurrent,
                'bg-gray-200 text-gray-400 cursor-not-allowed': !isVisited && !isCurrent
              }
            )}
            title={`Passo ${stepNumber}${isVisited ? ' (Visitado)' : ''}`}
          >
            {stepNumber}
          </button>
        );
      })}
    </div>
  );
}