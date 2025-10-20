import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormValidation, useFormNavigation } from '@/hooks/useFormValidation';
import { useFormStore } from '@/stores/form-store';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useFormValidation', () => {
  beforeEach(() => {
    // Reset store
    const { result } = renderHook(() => useFormStore());
    act(() => {
      result.current.clearFormData();
    });
  });

  describe('validateCurrentPage', () => {
    it('validates page 1 required fields', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: validationResult } = renderHook(() => useFormValidation());

      // Set current page to 1
      act(() => {
        storeResult.current.setCurrentPage(1);
      });

      // Validate with empty data
      let validationOutcome;
      await act(async () => {
        validationOutcome = await validationResult.current.validateCurrentPage();
      });

      expect(validationOutcome?.isValid).toBe(false);
      expect(Object.keys(validationOutcome?.errors || {}).length).toBeGreaterThan(0);
    });

    it('passes validation with complete data', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: validationResult } = renderHook(() => useFormValidation());

      // Set complete data for page 1
      act(() => {
        storeResult.current.setCurrentPage(1);
        storeResult.current.updateFormData({
          projectName: 'Test Project',
          passengerName: 'John Doe',
          passengerEmail: 'john@example.com',
          rg: '123456789',
          rgIssuer: 'SSP',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          phone: '(11) 98765-4321',
          bankDetails: 'Bank ABC, Account 12345',
          requestType: 'passages_per_diem',
        });
      });

      // Validate
      let validationOutcome;
      await act(async () => {
        validationOutcome = await validationResult.current.validateCurrentPage();
      });

      expect(validationOutcome?.isValid).toBe(true);
      expect(Object.keys(validationOutcome?.errors || {}).length).toBe(0);
    });

    it('skips validation for conditional pages when conditions not met', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: validationResult } = renderHook(() => useFormValidation());

      // Set page 5 (international) but isInternational is false
      act(() => {
        storeResult.current.setCurrentPage(5);
        storeResult.current.updateFormData({ isInternational: false });
      });

      // Validate
      let validationOutcome;
      await act(async () => {
        validationOutcome = await validationResult.current.validateCurrentPage();
      });

      expect(validationOutcome?.isValid).toBe(true);
    });
  });

  describe('validateField', () => {
    it('validates individual field', () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: validationResult } = renderHook(() => useFormValidation());

      act(() => {
        storeResult.current.setCurrentPage(1);
      });

      // Validate invalid email
      const emailError = validationResult.current.validateField('passengerEmail', 'invalid-email');
      expect(emailError).toBeDefined();

      // Validate valid email
      const noError = validationResult.current.validateField('passengerEmail', 'valid@example.com');
      expect(noError).toBeUndefined();
    });
  });

  describe('clearValidationErrors', () => {
    it('clears all validation errors', async () => {
      const { result } = renderHook(() => useFormValidation());

      // First trigger some errors
      await act(async () => {
        await result.current.validateCurrentPage();
      });

      // Clear errors
      act(() => {
        result.current.clearValidationErrors();
      });

      expect(result.current.validationErrors).toEqual({});
    });
  });

  describe('setFieldError and clearFieldError', () => {
    it('sets and clears individual field errors', () => {
      const { result } = renderHook(() => useFormValidation());

      // Set field error
      act(() => {
        result.current.setFieldError('passengerName', 'Name is required');
      });

      expect(result.current.validationErrors.passengerName).toBe('Name is required');

      // Clear field error
      act(() => {
        result.current.clearFieldError('passengerName');
      });

      expect(result.current.validationErrors.passengerName).toBeUndefined();
    });
  });
});

describe('useFormNavigation', () => {
  beforeEach(() => {
    // Reset store
    const { result } = renderHook(() => useFormStore());
    act(() => {
      result.current.clearFormData();
    });
    vi.clearAllMocks();
  });

  describe('navigateToPage', () => {
    it('allows navigation to visited pages without validation', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Visit pages 1, 2, 3
      act(() => {
        storeResult.current.setCurrentPage(3);
      });

      // Navigate back to page 1 without validation
      let success;
      await act(async () => {
        success = await navResult.current.navigateToPage(1);
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(1);
    });

    it('validates before navigating forward to unvisited page', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Set current page to 1 with incomplete data
      act(() => {
        storeResult.current.setCurrentPage(1);
      });

      // Try to navigate to page 2
      let success;
      await act(async () => {
        success = await navResult.current.navigateToPage(2);
      });

      expect(success).toBe(false);
      expect(navResult.current.currentPage).toBe(1);
    });

    it('navigates forward with valid data', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Set complete data for page 1
      act(() => {
        storeResult.current.setCurrentPage(1);
        storeResult.current.updateFormData({
          projectName: 'Test Project',
          passengerName: 'John Doe',
          passengerEmail: 'john@example.com',
          rg: '123456789',
          rgIssuer: 'SSP',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          phone: '(11) 98765-4321',
          bankDetails: 'Bank ABC',
          requestType: 'passages_per_diem',
        });
      });

      // Navigate to page 2
      let success;
      await act(async () => {
        success = await navResult.current.navigateToPage(2);
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(2);
    });
  });

  describe('navigateNext', () => {
    it('navigates to next available page', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Set complete data for page 1
      act(() => {
        storeResult.current.updateFormData({
          projectName: 'Test Project',
          passengerName: 'John Doe',
          passengerEmail: 'john@example.com',
          rg: '123456789',
          rgIssuer: 'SSP',
          cpf: '123.456.789-00',
          birthDate: '1990-01-01',
          phone: '(11) 98765-4321',
          bankDetails: 'Bank ABC',
          requestType: 'passages_per_diem',
        });
      });

      // Navigate next
      let success;
      await act(async () => {
        success = await navResult.current.navigateNext();
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(2);
    });

    it('skips conditional pages', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Set page 4 with all conditions false
      act(() => {
        storeResult.current.setCurrentPage(4);
        storeResult.current.updateFormData({
          isInternational: false,
          hasTimeRestrictions: false,
          hasFlightPreferences: false,
          baggageAllowance: true,
          transportAllowance: false,
          estimatedDailyAllowance: 100,
        });
      });

      // Navigate next should go to page 8
      let success;
      await act(async () => {
        success = await navResult.current.navigateNext();
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(8);
    });
  });

  describe('navigatePrevious', () => {
    it('navigates to previous available page', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      act(() => {
        storeResult.current.setCurrentPage(3);
      });

      let success;
      await act(async () => {
        success = await navResult.current.navigatePrevious();
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(2);
    });

    it('skips conditional pages when going back', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());

      // Set page 8 with all conditions false
      act(() => {
        storeResult.current.setCurrentPage(8);
        storeResult.current.updateFormData({
          isInternational: false,
          hasTimeRestrictions: false,
          hasFlightPreferences: false,
        });
      });

      // Navigate previous should go to page 4
      let success;
      await act(async () => {
        success = await navResult.current.navigatePrevious();
      });

      expect(success).toBe(true);
      expect(navResult.current.currentPage).toBe(4);
    });
  });

  describe('submitForm', () => {
    it('validates before submitting', async () => {
      const { result: navResult } = renderHook(() => useFormNavigation());
      const { toast } = await import('sonner');

      // Try to submit with invalid data
      let success;
      await act(async () => {
        success = await navResult.current.submitForm();
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });

    it('submits with valid data', async () => {
      const { result: storeResult } = renderHook(() => useFormStore());
      const { result: navResult } = renderHook(() => useFormNavigation());
      const { toast } = await import('sonner');

      // Set page 8 with valid data
      act(() => {
        storeResult.current.setCurrentPage(8);
        storeResult.current.updateFormData({
          tripObjective: 'Business meeting with client to discuss project requirements',
          isUrgent: false,
        });
      });

      // Submit form
      let success;
      await act(async () => {
        success = await navResult.current.submitForm();
      });

      expect(success).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });
  });
});