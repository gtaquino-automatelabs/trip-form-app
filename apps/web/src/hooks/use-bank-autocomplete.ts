import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface BankOption {
  value: string;
  label: string;
  code: string;
}

interface UseBankAutocompleteReturn {
  // State
  options: BankOption[];
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  searchTerm: string;
  
  // Actions
  search: (term: string) => void;
  setIsOpen: (open: boolean) => void;
  clearSearch: () => void;
  refresh: () => void;
}

export function useBankAutocomplete(): UseBankAutocompleteReturn {
  const [options, setOptions] = useState<BankOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBanks, setAllBanks] = useState<BankOption[]>([]);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    async (term: string) => {
      if (!term.trim()) {
        setOptions(allBanks.slice(0, 20)); // Show first 20 banks when no search
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/banks?search=${encodeURIComponent(term)}&limit=50`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setOptions(data.banks || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search banks';
        setError(errorMessage);
        console.error('Bank search error:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    300 // 300ms delay
  );

  // Load all banks on mount
  const loadAllBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/banks?limit=200');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const banks = data.banks || [];
      setAllBanks(banks);
      setOptions(banks.slice(0, 20)); // Show first 20 initially
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load banks';
      setError(errorMessage);
      console.error('Load banks error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load banks on mount
  useEffect(() => {
    loadAllBanks();
  }, [loadAllBanks]);

  // Handle search input
  const search = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setOptions(allBanks.slice(0, 20));
    setError(null);
  }, [allBanks]);

  // Refresh data
  const refresh = useCallback(() => {
    loadAllBanks();
  }, [loadAllBanks]);

  // Memoized return object for performance
  return useMemo(() => ({
    options,
    loading,
    error,
    isOpen,
    searchTerm,
    search,
    setIsOpen,
    clearSearch,
    refresh
  }), [
    options,
    loading,
    error,
    isOpen,
    searchTerm,
    search,
    clearSearch,
    refresh
  ]);
}
