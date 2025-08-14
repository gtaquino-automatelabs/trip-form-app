import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFormStore } from '@/stores/form-store';

describe('FormStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useFormStore());
    act(() => {
      result.current.clearFormData();
    });
  });

  describe('updateFormData', () => {
    it('updates form data correctly', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({
          passengerName: 'John Doe',
          passengerEmail: 'john@example.com',
        });
      });

      expect(result.current.formData.passengerName).toBe('John Doe');
      expect(result.current.formData.passengerEmail).toBe('john@example.com');
    });

    it('merges data without overwriting existing fields', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ passengerName: 'John Doe' });
      });
      
      act(() => {
        result.current.updateFormData({ passengerEmail: 'john@example.com' });
      });

      expect(result.current.formData.passengerName).toBe('John Doe');
      expect(result.current.formData.passengerEmail).toBe('john@example.com');
    });
  });

  describe('setCurrentPage', () => {
    it('sets current page correctly', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });

    it('adds page to visitedPages when setting new page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.visitedPages).toContain(2);
    });

    it('does not duplicate pages in visitedPages', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(2);
      });
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      const count = result.current.visitedPages.filter(p => p === 2).length;
      expect(count).toBe(1);
    });

    it('keeps visitedPages sorted', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(3);
      });
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.visitedPages).toEqual([1, 2, 3]);
    });
  });

  describe('markPageVisited', () => {
    it('adds page to visitedPages', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.markPageVisited(4);
      });

      expect(result.current.visitedPages).toContain(4);
    });

    it('does not duplicate pages', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.markPageVisited(3);
        result.current.markPageVisited(3);
      });

      const count = result.current.visitedPages.filter(p => p === 3).length;
      expect(count).toBe(1);
    });
  });

  describe('clearFormData', () => {
    it('resets all data to initial state', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ passengerName: 'John Doe' });
        result.current.setCurrentPage(5);
      });
      
      act(() => {
        result.current.clearFormData();
      });

      expect(result.current.formData.passengerName).toBeUndefined();
      expect(result.current.currentPage).toBe(1);
      expect(result.current.visitedPages).toEqual([1]);
    });
  });

  describe('resetNavigation', () => {
    it('resets navigation state without clearing form data', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ passengerName: 'John Doe' });
        result.current.setCurrentPage(5);
      });
      
      act(() => {
        result.current.resetNavigation();
      });

      expect(result.current.formData.passengerName).toBe('John Doe');
      expect(result.current.currentPage).toBe(1);
      expect(result.current.visitedPages).toEqual([1]);
    });
  });

  describe('canNavigateToPage', () => {
    it('allows navigation to visited pages', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(result.current.canNavigateToPage(1)).toBe(true);
      expect(result.current.canNavigateToPage(2)).toBe(true);
      expect(result.current.canNavigateToPage(3)).toBe(true);
    });

    it('allows navigation to next unvisited page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.canNavigateToPage(3)).toBe(true);
    });

    it('prevents navigation to non-sequential unvisited pages', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.canNavigateToPage(5)).toBe(false);
    });

    it('prevents navigation to international page when not international', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ isInternational: false });
        result.current.setCurrentPage(4);
      });

      expect(result.current.canNavigateToPage(5)).toBe(false);
    });

    it('allows navigation to international page when international', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ isInternational: true });
        result.current.setCurrentPage(4);
      });

      expect(result.current.canNavigateToPage(5)).toBe(true);
    });
  });

  describe('getNextAvailablePage', () => {
    it('returns next sequential page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.getNextAvailablePage()).toBe(3);
    });

    it('skips international page when not international', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ 
          isInternational: false,
          hasTimeRestrictions: true,  // Enable time restrictions page
          hasFlightPreferences: false
        });
        result.current.setCurrentPage(4);
      });

      expect(result.current.getNextAvailablePage()).toBe(6);
    });

    it('skips time restrictions page when no restrictions', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ 
          isInternational: false,
          hasTimeRestrictions: false,
          hasFlightPreferences: true  // Enable flight preferences page
        });
        result.current.setCurrentPage(4);
      });

      expect(result.current.getNextAvailablePage()).toBe(7);
    });

    it('skips flight preferences page when no preferences', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ 
          isInternational: false,
          hasTimeRestrictions: false,
          hasFlightPreferences: false
        });
        result.current.setCurrentPage(4);
      });

      expect(result.current.getNextAvailablePage()).toBe(8);
    });

    it('returns 8 when already at last page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(8);
      });

      expect(result.current.getNextAvailablePage()).toBe(8);
    });
  });

  describe('getPreviousAvailablePage', () => {
    it('returns previous sequential page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(result.current.getPreviousAvailablePage()).toBe(2);
    });

    it('skips flight preferences page when no preferences (going back)', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ 
          hasFlightPreferences: false,
          hasTimeRestrictions: true  // Time restrictions are enabled
        });
        result.current.setCurrentPage(8);
      });

      expect(result.current.getPreviousAvailablePage()).toBe(6);
    });

    it('skips all conditional pages when conditions not met (going back)', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.updateFormData({ 
          isInternational: false,
          hasTimeRestrictions: false,
          hasFlightPreferences: false
        });
        result.current.setCurrentPage(8);
      });

      expect(result.current.getPreviousAvailablePage()).toBe(4);
    });

    it('returns 1 when already at first page', () => {
      const { result } = renderHook(() => useFormStore());
      
      act(() => {
        result.current.setCurrentPage(1);
      });

      expect(result.current.getPreviousAvailablePage()).toBe(1);
    });
  });
});