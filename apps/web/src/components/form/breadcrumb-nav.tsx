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
      {/* Desktop Breadcrumb - Improved responsive layout */}
      <div className="hidden md:block">
        <ol className="flex items-center flex-wrap gap-x-2 gap-y-2">
          {FORM_STEPS.map((stepName, index) => {
            const stepNumber = index + 1;
            const isVisited = visitedPages.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const canNavigate = isVisited && !isCurrent;

            return (
              <li key={stepNumber} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
                )}
                
                <button
                  onClick={() => canNavigate && onNavigate(stepNumber)}
                  disabled={!canNavigate}
                  className={cn(
                    'flex items-center px-2 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    {
                      'bg-blue-600 text-white cursor-default': isCurrent,
                      'text-blue-600 hover:bg-blue-50 cursor-pointer': canNavigate,
                      'text-gray-400 cursor-not-allowed': !isVisited && !isCurrent
                    }
                  )}
                  title={`${stepNumber}. ${stepName}${isVisited ? ' (Visitado)' : ''}`}
                >
                  {isVisited && !isCurrent && (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {/* Show step number + abbreviated name on medium screens */}
                  <span className="hidden xl:inline">{stepNumber}. {stepName}</span>
                  <span className="hidden lg:inline xl:hidden">{stepNumber}. {stepName.split(' ')[0]}</span>
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
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex justify-center flex-wrap gap-2 mt-3">
          {FORM_STEPS.map((stepName, index) => {
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
                  'w-8 h-8 rounded-full transition-all flex items-center justify-center text-xs font-medium',
                  {
                    'bg-blue-600 text-white': isCurrent,
                    'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer': canNavigate,
                    'bg-gray-200 text-gray-400': !isVisited && !isCurrent
                  }
                )}
                aria-label={`Ir para passo ${stepNumber}: ${stepName}`}
                title={`${stepNumber}. ${stepName}`}
              >
                {stepNumber}
              </button>
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
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}
            
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={cn(
                  'text-sm font-medium transition-colors',
                  item.active
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium',
                  item.active
                    ? 'text-gray-900'
                    : 'text-gray-500'
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