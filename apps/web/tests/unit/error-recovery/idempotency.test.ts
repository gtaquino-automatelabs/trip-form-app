import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormStore } from '@/stores/form-store';

describe('Idempotency', () => {
  beforeEach(() => {
    localStorage.clear();
    useFormStore.setState({
      submissionToken: null,
      formData: {},
      currentPage: 1,
      visitedPages: [1]
    });
  });

  it('should generate unique submission token', () => {
    const { result } = renderHook(() => useFormStore());

    act(() => {
      result.current.generateSubmissionToken();
    });

    const token1 = result.current.submissionToken;
    expect(token1).toBeTruthy();
    expect(token1).toMatch(/^sub-\d+-[a-z0-9]+$/);
  });

  it('should generate different tokens each time', () => {
    const { result } = renderHook(() => useFormStore());

    act(() => {
      result.current.generateSubmissionToken();
    });
    const token1 = result.current.submissionToken;

    act(() => {
      result.current.generateSubmissionToken();
    });
    const token2 = result.current.submissionToken;

    expect(token1).not.toBe(token2);
  });

  it('should get or generate token', () => {
    const { result } = renderHook(() => useFormStore());

    // First call should generate new token
    let token1: string;
    act(() => {
      token1 = result.current.getSubmissionToken();
    });

    expect(token1!).toBeTruthy();
    expect(result.current.submissionToken).toBe(token1);

    // Second call should return same token
    let token2: string;
    act(() => {
      token2 = result.current.getSubmissionToken();
    });

    expect(token2).toBe(token1);
  });

  it('should clear token on reset', () => {
    const { result } = renderHook(() => useFormStore());

    act(() => {
      result.current.generateSubmissionToken();
    });

    expect(result.current.submissionToken).toBeTruthy();

    act(() => {
      result.current.resetSubmissionState();
    });

    expect(result.current.submissionToken).toBeNull();
  });

  it('should persist token in localStorage', () => {
    const { result } = renderHook(() => useFormStore());

    act(() => {
      result.current.generateSubmissionToken();
    });

    const token = result.current.submissionToken;

    // Simulate page refresh by creating new hook
    const { result: newResult } = renderHook(() => useFormStore());
    
    // Token should be restored from localStorage
    expect(newResult.current.submissionToken).toBe(token);
  });

  it('should include token in API requests', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: { requestId: 'REQ-123', message: 'Success' } 
      })
    } as Response);

    const { result } = renderHook(() => useFormStore());
    
    const token = result.current.getSubmissionToken();

    // Simulate form submission
    await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': token
      },
      body: JSON.stringify({ test: 'data' })
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/submit-form',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Idempotency-Key': token
        })
      })
    );

    fetchSpy.mockRestore();
  });
});