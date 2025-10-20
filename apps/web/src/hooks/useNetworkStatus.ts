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

// Singleton to prevent multiple instances from polling simultaneously
class NetworkStatusManager {
  private static instance: NetworkStatusManager;
  private subscribers: Set<(status: NetworkStatus) => void> = new Set();
  private status: NetworkStatus = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isChecking: false,
    lastChecked: null,
    retryCount: 0
  };
  private intervalId: NodeJS.Timeout | null = null;
  private checkInterval = 30000;
  private apiEndpoint = '/api/health';
  private enableHeartbeat = true;

  static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager();
    }
    return NetworkStatusManager.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.startHeartbeat();
    }
  }

  private setupEventListeners() {
    const handleOnline = () => {
      this.updateStatus({
        ...this.status,
        isOnline: true,
        retryCount: 0
      });
      this.checkConnectivity();
    };

    const handleOffline = () => {
      this.updateStatus({
        ...this.status,
        isOnline: false
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  private updateStatus(newStatus: NetworkStatus) {
    this.status = newStatus;
    this.subscribers.forEach(callback => callback(this.status));
  }

  private async checkConnectivity(): Promise<boolean> {
    if (!this.enableHeartbeat) {
      return navigator.onLine;
    }

    this.updateStatus({ ...this.status, isChecking: true });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.apiEndpoint, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      
      this.updateStatus({
        isOnline: isConnected,
        isChecking: false,
        lastChecked: new Date(),
        retryCount: isConnected ? 0 : this.status.retryCount + 1
      });

      return isConnected;
    } catch (error) {
      this.updateStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
        retryCount: this.status.retryCount + 1
      });
      return false;
    }
  }

  private startHeartbeat() {
    if (this.enableHeartbeat && !this.intervalId) {
      // Initial check
      this.checkConnectivity();
      
      // Set up interval
      this.intervalId = setInterval(() => {
        this.checkConnectivity();
      }, this.checkInterval);
    }
  }

  subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current status
    callback(this.status);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  retry(): Promise<boolean> {
    return this.checkConnectivity();
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isChecking: false,
    lastChecked: null,
    retryCount: 0
  });

  useEffect(() => {
    const manager = NetworkStatusManager.getInstance();
    
    // Subscribe to status updates
    const unsubscribe = manager.subscribe(setStatus);
    
    return unsubscribe;
  }, []);

  const retry = useCallback(() => {
    return NetworkStatusManager.getInstance().retry();
  }, []);

  const checkConnectivity = useCallback(() => {
    return NetworkStatusManager.getInstance().retry();
  }, []);

  return {
    ...status,
    retry,
    checkConnectivity
  };
}

export default useNetworkStatus;