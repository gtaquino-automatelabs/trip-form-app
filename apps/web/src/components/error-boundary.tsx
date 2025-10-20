'use client';

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to our error logging service
    logError({
      message: `React Error Boundary: ${error.message}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      },
      metadata: {
        errorInfo: errorInfo.componentStack,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              Encontramos um erro inesperado. Nossos dados foram salvos automaticamente.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <p className="font-mono text-red-600 mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="overflow-x-auto text-gray-600">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="default"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;