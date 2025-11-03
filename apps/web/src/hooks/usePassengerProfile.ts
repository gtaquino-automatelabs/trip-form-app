import { useState, useCallback, useEffect } from 'react';
import type { PassengerProfile } from '@/types/profile';
import { toast } from 'sonner';

interface UsePassengerProfileReturn {
  profile: PassengerProfile | null;
  hasProfile: boolean;
  isLoading: boolean;
  isSaving: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (data: Omit<PassengerProfile, 'savedAt'>) => Promise<boolean>;
  clearProfile: () => Promise<boolean>;
}

export function usePassengerProfile(): UsePassengerProfileReturn {
  const [profile, setProfile] = useState<PassengerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile on mount
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/passenger-profile');

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, silently fail
          setProfile(null);
          return;
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Error loading passenger profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile
  const saveProfile = useCallback(async (data: Omit<PassengerProfile, 'savedAt'>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/passenger-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      // Reload profile to get updated data
      await loadProfile();

      toast.success('Perfil salvo com sucesso! Seus dados serão preenchidos automaticamente em futuras solicitações.');
      return true;
    } catch (error) {
      console.error('Error saving passenger profile:', error);
      toast.error('Erro ao salvar perfil. Por favor, tente novamente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [loadProfile]);

  // Clear profile
  const clearProfile = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/passenger-profile', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear profile');
      }

      setProfile(null);
      toast.success('Perfil removido com sucesso.');
      return true;
    } catch (error) {
      console.error('Error clearing passenger profile:', error);
      toast.error('Erro ao remover perfil. Por favor, tente novamente.');
      return false;
    }
  }, []);

  return {
    profile,
    hasProfile: profile !== null,
    isLoading,
    isSaving,
    loadProfile,
    saveProfile,
    clearProfile,
  };
}
