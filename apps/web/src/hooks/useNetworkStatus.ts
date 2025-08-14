'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  retryCount: number;
}

interface UseNetworkStatusOptions {
  checkInterval?: number;
  apiEndpoint?: string;
  enableHeartbeat?: boolean;
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const {
    checkInterval = 30000, // 30 seconds
    apiEndpoint = '/api/health',
    enableHeartbeat = true
  } = options;

  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isChecking: false,
    lastChecked: null,
    retryCount: 0
  });

  const checkConnectivity = useCallback(async () => {
    if (!enableHeartbeat) {
      return navigator.onLine;
    }

    setStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiEndpoint, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      
      setStatus(prev => ({
        isOnline: isConnected,
        isChecking: false,
        lastChecked: new Date(),
        retryCount: isConnected ? 0 : prev.retryCount + 1
      }));

      return isConnected;
    } catch (error) {
      setStatus(prev => ({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
        retryCount: prev.retryCount + 1
      }));
      return false;
    }
  }, [apiEndpoint, enableHeartbeat]);

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: true,
        retryCount: 0 
      }));
      checkConnectivity();
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectivity();

    // Set up heartbeat check
    let intervalId: NodeJS.Timeout | null = null;
    if (enableHeartbeat) {
      intervalId = setInterval(checkConnectivity, checkInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkConnectivity, checkInterval, enableHeartbeat]);

  const retry = useCallback(() => {
    return checkConnectivity();
  }, [checkConnectivity]);

  return {
    ...status,
    retry,
    checkConnectivity
  };
}

export default useNetworkStatus;