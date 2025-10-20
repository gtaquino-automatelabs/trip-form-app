'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
}

export const FORM_STEPS = [
  'Dados do Passageiro',
  'Detalhes da Viagem',
  'Tipo de Despesa',
  'Preferências',
  'Internacional',
  'Restrições de Horário',
  'Sugestão de Voos',
  'Objetivo da Viagem'
] as const;

export function ProgressBar({ 
  currentStep, 
  totalSteps = 8,
  className 
}: ProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentStepName = FORM_STEPS[currentStep - 1] || '';

  return (
    <div className={cn('w-full', className)}>
      {/* Step Name and Counter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {currentStepName}
        </h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {currentStep} de {totalSteps}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Dots */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div
                key={stepNumber}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900',
                  {
                    'bg-blue-600 ring-blue-600': isCompleted || isCurrent,
                    'bg-gray-300 ring-gray-300 dark:bg-gray-600 dark:ring-gray-600': !isCompleted && !isCurrent,
                    'scale-125': isCurrent
                  }
                )}
                title={FORM_STEPS[index]}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile Step List - Hidden on larger screens */}
      <div className="mt-4 sm:hidden">
        <select 
          value={currentStep}
          disabled
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {FORM_STEPS.map((step, index) => (
            <option key={step} value={index + 1}>
              {index + 1}. {step}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Step List - Hidden on mobile */}
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
        {FORM_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={step}
              className={cn(
                'text-xs text-center transition-all duration-300',
                {
                  'text-blue-600 dark:text-blue-400 font-medium': isCurrent,
                  'text-gray-900 dark:text-gray-300': isCompleted,
                  'text-gray-400 dark:text-gray-600': !isCompleted && !isCurrent
                }
              )}
            >
              <div className="truncate" title={step}>
                {stepNumber}. {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}