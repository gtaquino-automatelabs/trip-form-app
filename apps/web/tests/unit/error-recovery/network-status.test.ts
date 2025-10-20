import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
  let originalNavigatorOnline: boolean;
  let fetchSpy: any;

  beforeEach(() => {
    originalNavigatorOnline = navigator.onLine;
    fetchSpy = vi.spyOn(global, 'fetch');
    vi.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalNavigatorOnline
    });
    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should initialize with navigator.onLine status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('should detect when going offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });

  it('should detect when going online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('should perform heartbeat check', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => 
      useNetworkStatus({ 
        checkInterval: 1000,
        enableHeartbeat: true 
      })
    );

    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        method: 'HEAD',
        cache: 'no-cache'
      })
    );
    expect(result.current.isOnline).toBe(true);
  });

  it('should handle heartbeat check failure', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => 
      useNetworkStatus({ enableHeartbeat: true })
    );

    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.retryCount).toBe(1);
  });

  it('should increment retry count on failures', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useNetworkStatus({ enableHeartbeat: true })
    );

    await act(async () => {
      await result.current.checkConnectivity();
    });
    expect(result.current.retryCount).toBe(1);

    await act(async () => {
      await result.current.checkConnectivity();
    });
    expect(result.current.retryCount).toBe(2);
  });

  it('should reset retry count on success', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => 
      useNetworkStatus({ enableHeartbeat: true })
    );

    await act(async () => {
      await result.current.checkConnectivity();
    });
    expect(result.current.retryCount).toBe(1);

    fetchSpy.mockResolvedValueOnce({ ok: true });
    await act(async () => {
      await result.current.checkConnectivity();
    });
    expect(result.current.retryCount).toBe(0);
  });

  it('should provide manual retry function', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => 
      useNetworkStatus({ enableHeartbeat: true })
    );

    const success = await act(async () => {
      return await result.current.retry();
    });

    expect(success).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();
  });
});