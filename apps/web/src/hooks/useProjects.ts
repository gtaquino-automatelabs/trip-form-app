import { useState, useEffect, useCallback, useRef } from 'react';

// Project data structure for the dropdown
export interface Project {
  id: string;
  name: string;
}

// API response types
interface ProjectsResponse {
  success: true;
  data: Project[];
}

interface ErrorResponse {
  success: false;
  error: { message: string; code: string; };
}

type ApiResponse = ProjectsResponse | ErrorResponse;

// Hook state interface
interface UseProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

// Hook return interface
export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const MAX_RETRIES = 3;

export function useProjects(): UseProjectsReturn {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: false,
    error: null,
    lastFetch: null,
  });

  const retryCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const fetchProjects = useCallback(async (isRetry = false): Promise<void> => {
    // Don't fetch if we have fresh data (unless it's a manual refetch)
    if (!isRetry && state.lastFetch && Date.now() - state.lastFetch < CACHE_DURATION) {
      return;
    }

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/projetos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to access projects.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('Failed to load projects.');
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error.message || 'Failed to load projects');
      }

      setState({
        projects: data.data,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });

      retryCount.current = 0; // Reset retry count on success

    } catch (error) {
      // Ignore aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Implement exponential backoff retry logic
      if (retryCount.current < MAX_RETRIES && !isRetry) {
        retryCount.current++;
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount.current - 1);
        
        setTimeout(() => {
          fetchProjects(true);
        }, delay);

        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      retryCount.current = 0; // Reset retry count
    }
  }, [state.lastFetch]);

  const refetch = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, lastFetch: null })); // Force refetch
    await fetchProjects();
  }, [fetchProjects]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
    
    // Cleanup function to abort ongoing requests
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchProjects]);

  // Refetch on window focus if data is stale
  useEffect(() => {
    const handleFocus = () => {
      if (state.lastFetch && Date.now() - state.lastFetch > CACHE_DURATION) {
        fetchProjects();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [state.lastFetch, fetchProjects]);

  return {
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    refetch,
    clearError,
  };
}
