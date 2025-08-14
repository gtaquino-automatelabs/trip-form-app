import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useFormStore } from '@/stores/form-store';

vi.mock('@/stores/form-store');

describe('useAutoSave', () => {
  let mockFormStore: any;
  let localStorageSpy: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    mockFormStore = {
      formData: { passengerName: 'Test User' },
      currentPage: 1,
      visitedPages: [1],
      uploadedFiles: { flights: [] },
      setLastAutoSave: vi.fn(),
      setHasRecoverableData: vi.fn()
    };
    
    (useFormStore as any).mockReturnValue(mockFormStore);
    
    localStorageSpy = {
      getItem: vi.spyOn(Storage.prototype, 'getItem'),
      setItem: vi.spyOn(Storage.prototype, 'setItem'),
      removeItem: vi.spyOn(Storage.prototype, 'removeItem')
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should save form data to localStorage', async () => {
    const { result } = renderHook(() => useAutoSave({ enabled: true }));

    await act(async () => {
      await vi.runOnlyPendingTimers();
    });

    expect(localStorageSpy.setItem).toHaveBeenCalledWith(
      'travelForm_autoSave',
      expect.stringContaining('"passengerName":"Test User"')
    );
    expect(mockFormStore.setLastAutoSave).toHaveBeenCalled();
  });

  it('should auto-save at specified intervals', async () => {
    renderHook(() => useAutoSave({ 
      enabled: true, 
      interval: 5000 
    }));

    // Initial save
    await act(async () => {
      await vi.advanceTimersByTime(1000); // Debounce delay
    });
    expect(localStorageSpy.setItem).toHaveBeenCalledTimes(1);

    // Interval save
    await act(async () => {
      await vi.advanceTimersByTime(5000);
    });
    expect(localStorageSpy.setItem).toHaveBeenCalledTimes(2);
  });

  it('should debounce saves on form changes', async () => {
    const { rerender } = renderHook(
      () => useAutoSave({ enabled: true, debounceDelay: 1000 })
    );

    // Multiple rapid changes
    mockFormStore.formData = { passengerName: 'User 1' };
    rerender();
    
    mockFormStore.formData = { passengerName: 'User 2' };
    rerender();
    
    mockFormStore.formData = { passengerName: 'User 3' };
    rerender();

    // Should not save immediately
    expect(localStorageSpy.setItem).not.toHaveBeenCalled();

    // Wait for debounce
    await act(async () => {
      await vi.advanceTimersByTime(1000);
    });

    // Should save only once with latest data
    expect(localStorageSpy.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageSpy.setItem).toHaveBeenCalledWith(
      'travelForm_autoSave',
      expect.stringContaining('"passengerName":"User 3"')
    );
  });

  it('should not save when disabled', async () => {
    renderHook(() => useAutoSave({ enabled: false }));

    await act(async () => {
      await vi.advanceTimersByTime(30000);
    });

    expect(localStorageSpy.setItem).not.toHaveBeenCalled();
  });

  it('should check for recoverable data on mount', () => {
    const savedData = {
      version: '1.0',
      timestamp: Date.now(),
      formData: { passengerName: 'Saved User' }
    };
    
    localStorageSpy.getItem.mockReturnValueOnce(JSON.stringify(savedData));

    renderHook(() => useAutoSave());

    expect(localStorageSpy.getItem).toHaveBeenCalledWith('travelForm_autoSave');
    expect(mockFormStore.setHasRecoverableData).toHaveBeenCalledWith(true);
  });

  it('should handle localStorage quota exceeded error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageSpy.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const { result } = renderHook(() => useAutoSave({ enabled: true }));

    const success = await act(async () => {
      return result.current.manualSave();
    });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error auto-saving form:',
      expect.any(DOMException)
    );

    consoleSpy.mockRestore();
  });

  it('should save on page unload', () => {
    renderHook(() => useAutoSave({ enabled: true }));

    const event = new Event('beforeunload');
    window.dispatchEvent(event);

    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });

  it('should clear auto-save data', async () => {
    const { result } = renderHook(() => useAutoSave());

    act(() => {
      result.current.clearAutoSave();
    });

    expect(localStorageSpy.removeItem).toHaveBeenCalledWith('travelForm_autoSave');
    expect(mockFormStore.setHasRecoverableData).toHaveBeenCalledWith(false);
    expect(mockFormStore.setLastAutoSave).toHaveBeenCalledWith(null);
  });

  it('should include version in saved data', async () => {
    const { result } = renderHook(() => useAutoSave({ enabled: true }));

    await act(async () => {
      result.current.manualSave();
    });

    const savedData = JSON.parse(localStorageSpy.setItem.mock.calls[0][1]);
    expect(savedData.version).toBe('1.0');
    expect(savedData.timestamp).toBeDefined();
    expect(savedData.formData).toEqual(mockFormStore.formData);
  });
});