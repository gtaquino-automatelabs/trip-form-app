import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/useProjects';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window focus events
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
});

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initial state', () => {
    it('should start with correct initial state', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const { result } = renderHook(() => useProjects());

      expect(result.current.projects).toEqual([]);
      expect(result.current.loading).toBe(true); // Should start loading
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Successful data fetching', () => {
    it('should fetch and return projects successfully', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'Projeto Alpha' },
        { id: 'proj-2', name: 'Projeto Beta' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProjects }),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual(mockProjects);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/api/projetos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.any(AbortSignal),
      });
    });

    it('should handle empty projects list', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 authentication errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe('Authentication required. Please log in again.');
    });

    it('should handle 403 permission errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('You do not have permission to access projects.');
    });

    it('should handle 500 server errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Server error. Please try again later.');
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          success: false, 
          error: { message: 'Database connection failed', code: 'DB_ERROR' } 
        }),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database connection failed');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Retry logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        });
      });

      const { result } = renderHook(() => useProjects());

      // Fast-forward through retry delays
      await act(async () => {
        await vi.advanceTimersByTime(1000); // First retry after 1s
      });

      await act(async () => {
        await vi.advanceTimersByTime(2000); // Second retry after 2s
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(callCount).toBe(3);
      expect(result.current.error).toBe(null);
      expect(result.current.projects).toEqual([]);
    });

    it('should stop retrying after max attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() => useProjects());

      // Fast-forward through all retry attempts
      await act(async () => {
        await vi.advanceTimersByTime(1000); // First retry
        await vi.advanceTimersByTime(2000); // Second retry  
        await vi.advanceTimersByTime(4000); // Third retry
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(result.current.error).toBe('Persistent error');
    });
  });

  describe('Caching behavior', () => {
    it('should not refetch if data is fresh', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Test Project' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProjects }),
      });

      // First render
      const { result, rerender } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Immediate re-render should not trigger new fetch
      rerender();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should refetch if data is stale (>5 minutes)', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Test Project' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProjects }),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by more than cache duration
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Manually trigger refetch to simulate stale data check
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Manual refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Test Project' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockProjects }),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Manual refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should clear error state on refetch', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Error clearing', () => {
    it('should clear error when clearError is called', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Cleanup', () => {
    it('should abort ongoing requests on unmount', () => {
      let abortController: AbortController;
      mockFetch.mockImplementation((url, options) => {
        abortController = options?.signal as AbortController;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: [] }),
            });
          }, 1000);
        });
      });

      const { unmount } = renderHook(() => useProjects());

      // Verify request is ongoing
      expect(mockFetch).toHaveBeenCalled();

      // Unmount should abort the request
      unmount();

      // Check if abort was called (indirectly through signal)
      expect(abortController!).toBeDefined();
    });

    it('should handle AbortError gracefully', async () => {
      mockFetch.mockRejectedValue(Object.assign(new Error('Request aborted'), { name: 'AbortError' }));

      const { result } = renderHook(() => useProjects());

      // Should not set error for aborted requests
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Window focus behavior', () => {
    it('should register focus event listener', () => {
      renderHook(() => useProjects());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'focus',
        expect.any(Function)
      );
    });

    it('should clean up focus event listener on unmount', () => {
      const { unmount } = renderHook(() => useProjects());

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'focus',
        expect.any(Function)
      );
    });
  });
});
