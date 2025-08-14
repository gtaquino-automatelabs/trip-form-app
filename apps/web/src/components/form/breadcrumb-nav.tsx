'use client';

import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORM_STEPS } from './progress-bar';

interface BreadcrumbNavProps {
  currentStep: number;
  visitedPages: number[];
  onNavigate: (step: number) => void;
  className?: string;
}

export function BreadcrumbNav({
  currentStep,
  visitedPages,
  onNavigate,
  className
}: BreadcrumbNavProps) {
  return (
    <nav aria-label="Navegação do formulário" className={cn('w-full', className)}>
      {/* Desktop Breadcrumb */}
      <div className="hidden md:block">
        <ol className="flex items-center space-x-2">
          {FORM_STEPS.map((stepName, index) => {
            const stepNumber = index + 1;
            const isVisited = visitedPages.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const canNavigate = isVisited && !isCurrent;

            return (
              <li key={stepNumber} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-gray-400 dark:text-gray-600" />
                )}
                
                <button
                  onClick={() => canNavigate && onNavigate(stepNumber)}
                  disabled={!canNavigate}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    {
                      'bg-blue-600 text-white cursor-default': isCurrent,
                      'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800 cursor-pointer': canNavigate,
                      'text-gray-400 dark:text-gray-600 cursor-not-allowed': !isVisited && !isCurrent
                    }
                  )}
                  title={`${stepNumber}. ${stepName}${isVisited ? ' (Visitado)' : ''}`}
                >
                  {isVisited && !isCurrent && (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  <span className="hidden lg:inline">{stepNumber}. {stepName}</span>
                  <span className="lg:hidden">{stepNumber}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile Dropdown Breadcrumb */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <select
            value={currentStep}
            onChange={(e) => {
              const step = parseInt(e.target.value, 10);
              if (visitedPages.includes(step)) {
                onNavigate(step);
              }
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FORM_STEPS.map((stepName, index) => {
              const stepNumber = index + 1;
              const isVisited = visitedPages.includes(stepNumber);
              const isCurrent = stepNumber === currentStep;
              
              return (
                <option
                  key={stepNumber}
                  value={stepNumber}
                  disabled={!isVisited}
                >
                  {isVisited && '✓ '}
                  {stepNumber}. {stepName}
                  {isCurrent && ' (Atual)'}
                </option>
              );
            })}
          </select>
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center space-x-1.5 mt-3">
          {FORM_STEPS.map((_, index) => {
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
                  'w-2 h-2 rounded-full transition-all',
                  {
                    'bg-blue-600 w-6': isCurrent,
                    'bg-blue-400 hover:bg-blue-500 cursor-pointer': canNavigate,
                    'bg-gray-300 dark:bg-gray-600': !isVisited && !isCurrent
                  }
                )}
                aria-label={`Ir para passo ${stepNumber}`}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}

interface SimpleBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  className?: string;
}

export function SimpleBreadcrumb({ items, className }: SimpleBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400 dark:text-gray-600" />
            )}
            
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={cn(
                  'text-sm font-medium transition-colors',
                  item.active
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium',
                  item.active
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}