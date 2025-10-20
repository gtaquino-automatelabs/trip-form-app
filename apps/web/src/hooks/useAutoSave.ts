'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFormStore } from '@/stores/form-store';
import { toast } from 'sonner';

const AUTO_SAVE_KEY = 'travelForm_autoSave';
const AUTO_SAVE_VERSION = '1.0';

interface AutoSaveOptions {
  interval?: number;
  enabled?: boolean;
  showNotification?: boolean;
  debounceDelay?: number;
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const {
    interval = 30000, // 30 seconds
    enabled = true,
    showNotification = false,
    debounceDelay = 1000
  } = options;

  const {
    formData,
    currentPage,
    visitedPages,
    uploadedFiles,
    setLastAutoSave,
    setHasRecoverableData
  } = useFormStore();

  const lastSaveRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        version: AUTO_SAVE_VERSION,
        timestamp: Date.now(),
        formData,
        currentPage,
        visitedPages,
        uploadedFiles
      };

      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(dataToSave));
      setLastAutoSave(Date.now());

      if (showNotification) {
        toast.success('Formulário salvo automaticamente', {
          duration: 2000,
          position: 'bottom-right'
        });
      }

      return true;
    } catch (error) {
      console.error('Error auto-saving form:', error);
      
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Armazenamento local cheio. Não foi possível salvar automaticamente.');
      }
      
      return false;
    }
  }, [formData, currentPage, visitedPages, uploadedFiles, setLastAutoSave, showNotification]);

  // Debounced save on form changes
  useEffect(() => {
    if (!enabled) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, debounceDelay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formData, enabled, debounceDelay, saveToLocalStorage]);

  // Interval-based auto-save
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      saveToLocalStorage();
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval, saveToLocalStorage]);

  // Check for recoverable data on mount
  useEffect(() => {
    const checkRecoverableData = () => {
      try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          const hasData = parsed.formData && Object.keys(parsed.formData).length > 0;
          setHasRecoverableData(hasData);
        }
      } catch (error) {
        console.error('Error checking recoverable data:', error);
      }
    };

    checkRecoverableData();
  }, [setHasRecoverableData]);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [saveToLocalStorage]);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
      setHasRecoverableData(false);
      setLastAutoSave(null);
    } catch (error) {
      console.error('Error clearing auto-save:', error);
    }
  }, [setHasRecoverableData, setLastAutoSave]);

  const manualSave = useCallback(() => {
    return saveToLocalStorage();
  }, [saveToLocalStorage]);

  return {
    manualSave,
    clearAutoSave,
    lastSave: lastSaveRef.current
  };
}

export default useAutoSave;