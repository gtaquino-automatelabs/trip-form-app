'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  className?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function OfflineBanner({
  className,
  dismissible = true,
  autoHide = true,
  autoHideDelay = 5000
}: OfflineBannerProps) {
  const { isOnline, isChecking, retry } = useNetworkStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline && !isDismissed) {
      setIsVisible(true);
    } else if (isOnline && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsDismissed(false);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isDismissed, autoHide, autoHideDelay]);

  const handleRetry = async () => {
    const connected = await retry();
    if (connected && autoHide) {
      setTimeout(() => {
        setIsVisible(false);
        setIsDismissed(false);
      }, autoHideDelay);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300',
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">
            {isOnline 
              ? 'Conexão restaurada!' 
              : 'Sem conexão com a internet'}
          </span>
          {!isOnline && (
            <span className="text-sm opacity-90">
              Suas alterações serão salvas localmente
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleRetry}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar novamente
                </>
              )}
            </Button>
          )}
          
          {dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1"
              onClick={handleDismiss}
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OfflineBanner;