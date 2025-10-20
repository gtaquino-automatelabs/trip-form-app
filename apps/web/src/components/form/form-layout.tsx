'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from './progress-bar';
import { Navigation } from './navigation';
import { BreadcrumbNav } from './breadcrumb-nav';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { useFormStore } from '@/stores/form-store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  const router = useRouter();
  const { clearFormData } = useFormStore();
  const supabase = createClientComponentClient();
  
  const handleExitForm = () => {
    if (window.confirm('Tem certeza que deseja sair do formulário? Os dados serão salvos automaticamente.')) {
      router.push('/');
    }
  };
  
  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja fazer logout? Todos os dados não salvos serão perdidos.')) {
      clearFormData();
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
      router.push('/login');
    }
  };
  return (
    <div className="min-h-screen relative">
      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content Container */}
        <main className="flex-1 container mx-auto px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Form Card - Responsive margins and padding */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-300">
              {/* Progress Section with ProgressBar and Breadcrumb */}
              <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Solicitação de Viagem
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={handleExitForm}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      title="Sair do formulário (dados salvos)"
                    >
                      <Home className="w-4 h-4" />
                      <span className="hidden sm:inline">Início</span>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      title="Fazer logout do sistema"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
                
                {/* Breadcrumb Navigation - Enhanced spacing */}
                {onNavigateToPage && (
                  <div className="mb-6">
                    <BreadcrumbNav
                      currentStep={currentStep}
                      visitedPages={visitedPages}
                      onNavigate={onNavigateToPage}
                    />
                  </div>
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
              <div className="p-4 sm:p-6 border-t border-gray-200">
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