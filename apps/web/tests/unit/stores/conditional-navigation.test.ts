import { describe, it, expect, beforeEach } from 'vitest';
import { useFormStore } from '@/stores/form-store';

describe('Form Store Conditional Navigation', () => {
  beforeEach(() => {
    // Reset store before each test
    useFormStore.getState().clearFormData();
  });

  describe('International destination detection', () => {
    it('detects international destinations correctly', () => {
      const { isInternationalDestination } = useFormStore.getState();
      
      // Test international destinations
      expect(isInternationalDestination('Buenos Aires, Argentina')).toBe(true);
      expect(isInternationalDestination('Madrid, Espanha')).toBe(true);
      expect(isInternationalDestination('New York, Estados Unidos')).toBe(true);
      expect(isInternationalDestination('Lisboa, Portugal')).toBe(true);
      expect(isInternationalDestination('Santiago, Chile')).toBe(true);
      
      // Test domestic destinations
      expect(isInternationalDestination('São Paulo, SP')).toBe(false);
      expect(isInternationalDestination('Rio de Janeiro, RJ')).toBe(false);
      expect(isInternationalDestination('Brasília, DF')).toBe(false);
      expect(isInternationalDestination('Salvador, BA')).toBe(false);
      
      // Test empty/null cases
      expect(isInternationalDestination('')).toBe(false);
      expect(isInternationalDestination(' ')).toBe(false);
    });

    it('is case insensitive', () => {
      const { isInternationalDestination } = useFormStore.getState();
      
      expect(isInternationalDestination('MADRID, ESPANHA')).toBe(true);
      expect(isInternationalDestination('madrid, espanha')).toBe(true);
      expect(isInternationalDestination('Madrid, espanha')).toBe(true);
    });

    it('auto-sets international flag when destination is updated', () => {
      const { updateFormData, formData } = useFormStore.getState();
      
      // Update with international destination
      updateFormData({ destination: 'Madrid, Espanha' });
      expect(useFormStore.getState().formData.isInternational).toBe(true);
      
      // Update with domestic destination
      updateFormData({ destination: 'São Paulo, SP' });
      expect(useFormStore.getState().formData.isInternational).toBe(false);
    });
  });

  describe('Page navigation logic', () => {
    it('allows navigation to page 5 only if international', () => {
      const { canNavigateToPage, updateFormData, markPageVisited } = useFormStore.getState();
      
      // Mark pages as visited to allow navigation
      markPageVisited(1);
      markPageVisited(2);
      markPageVisited(3);
      markPageVisited(4);
      
      // Should not allow navigation to page 5 for domestic travel
      updateFormData({ isInternational: false });
      expect(canNavigateToPage(5)).toBe(false);
      
      // Should allow navigation to page 5 for international travel
      updateFormData({ isInternational: true });
      expect(canNavigateToPage(5)).toBe(true);
    });

    it('allows navigation to page 6 only if has time restrictions', () => {
      const { canNavigateToPage, updateFormData, markPageVisited } = useFormStore.getState();
      
      // Mark pages as visited
      markPageVisited(1);
      markPageVisited(2);
      markPageVisited(3);
      markPageVisited(4);
      markPageVisited(5);
      
      // Should not allow navigation to page 6 without time restrictions
      updateFormData({ hasTimeRestrictions: false });
      expect(canNavigateToPage(6)).toBe(false);
      
      // Should allow navigation to page 6 with time restrictions
      updateFormData({ hasTimeRestrictions: true });
      expect(canNavigateToPage(6)).toBe(true);
    });

    it('allows navigation to page 7 only if has flight preferences', () => {
      const { canNavigateToPage, updateFormData, markPageVisited } = useFormStore.getState();
      
      // Mark pages as visited
      markPageVisited(1);
      markPageVisited(2);
      markPageVisited(3);
      markPageVisited(4);
      markPageVisited(5);
      markPageVisited(6);
      
      // Should not allow navigation to page 7 without flight preferences
      updateFormData({ hasFlightPreferences: false });
      expect(canNavigateToPage(7)).toBe(false);
      
      // Should allow navigation to page 7 with flight preferences
      updateFormData({ hasFlightPreferences: true });
      expect(canNavigateToPage(7)).toBe(true);
    });
  });

  describe('Next available page logic', () => {
    it('skips page 5 for domestic travel', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up domestic travel
      updateFormData({ 
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false 
      });
      
      // From page 4, should skip to page 8 (trip objective)
      setCurrentPage(4);
      expect(getNextAvailablePage()).toBe(8);
    });

    it('includes page 5 for international travel', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up international travel
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: false,
        hasFlightPreferences: false 
      });
      
      // From page 4, should go to page 5
      setCurrentPage(4);
      expect(getNextAvailablePage()).toBe(5);
    });

    it('skips page 6 when no time restrictions', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up with no time restrictions
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: false,
        hasFlightPreferences: false 
      });
      
      // From page 5, should skip to page 8
      setCurrentPage(5);
      expect(getNextAvailablePage()).toBe(8);
    });

    it('includes page 6 when has time restrictions', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up with time restrictions
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: true,
        hasFlightPreferences: false 
      });
      
      // From page 5, should go to page 6
      setCurrentPage(5);
      expect(getNextAvailablePage()).toBe(6);
    });

    it('includes page 7 when has flight preferences', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up with flight preferences
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: true,
        hasFlightPreferences: true 
      });
      
      // From page 6, should go to page 7
      setCurrentPage(6);
      expect(getNextAvailablePage()).toBe(7);
    });
  });

  describe('Previous available page logic', () => {
    it('skips conditional pages when going backward', () => {
      const { getPreviousAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up domestic travel with no additional preferences
      updateFormData({ 
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false 
      });
      
      // From page 8, should go back to page 4
      setCurrentPage(8);
      expect(getPreviousAvailablePage()).toBe(4);
    });

    it('includes conditional pages when going backward if conditions are met', () => {
      const { getPreviousAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      // Set up international travel with all preferences
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: true,
        hasFlightPreferences: true 
      });
      
      // From page 8, should go back to page 7
      setCurrentPage(8);
      expect(getPreviousAvailablePage()).toBe(7);
      
      // From page 7, should go back to page 6
      setCurrentPage(7);
      expect(getPreviousAvailablePage()).toBe(6);
      
      // From page 6, should go back to page 5
      setCurrentPage(6);
      expect(getPreviousAvailablePage()).toBe(5);
    });
  });

  describe('Complex conditional scenarios', () => {
    it('handles international travel with only time restrictions', () => {
      const { getNextAvailablePage, getPreviousAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: true,
        hasFlightPreferences: false 
      });
      
      // Should include pages 5 and 6, skip 7
      setCurrentPage(5);
      expect(getNextAvailablePage()).toBe(6);
      
      setCurrentPage(6);
      expect(getNextAvailablePage()).toBe(8);
      expect(getPreviousAvailablePage()).toBe(5);
    });

    it('handles international travel with only flight preferences', () => {
      const { getNextAvailablePage, getPreviousAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      updateFormData({ 
        isInternational: true,
        hasTimeRestrictions: false,
        hasFlightPreferences: true 
      });
      
      // Should include pages 5 and 7, skip 6
      setCurrentPage(5);
      expect(getNextAvailablePage()).toBe(7);
      
      setCurrentPage(7);
      expect(getNextAvailablePage()).toBe(8);
      expect(getPreviousAvailablePage()).toBe(5);
    });

    it('handles domestic travel with preferences', () => {
      const { getNextAvailablePage, updateFormData, setCurrentPage } = useFormStore.getState();
      
      updateFormData({ 
        isInternational: false,
        hasTimeRestrictions: true,
        hasFlightPreferences: true 
      });
      
      // Should skip page 5 but include 6 and 7
      setCurrentPage(4);
      expect(getNextAvailablePage()).toBe(6);
      
      setCurrentPage(6);
      expect(getNextAvailablePage()).toBe(7);
    });
  });
});