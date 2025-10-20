import { useState, useCallback, useMemo } from 'react';
import brazilianCities from '@/data/brazilian-cities.json';

export interface CityOption {
  value: string;
  label: string;
  state: string;
}

export function useCityAutocomplete() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Memoized filtered cities for performance
  const filteredCities = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    return brazilianCities
      .filter(city => 
        city.label.toLowerCase().includes(normalizedQuery) ||
        city.state.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 10); // Limit results for performance
  }, [query]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  }, []);

  const handleCitySelect = useCallback((city: CityOption) => {
    setQuery(city.label);
    setIsOpen(false);
    return city.label;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Check if a destination suggests international travel
  const isInternationalDestination = useCallback((destination: string) => {
    const normalizedDestination = destination.toLowerCase().trim();
    
    // Check if destination matches any Brazilian city
    const isBrazilianCity = brazilianCities.some(city =>
      city.label.toLowerCase().includes(normalizedDestination)
    );
    
    // Also check for common international indicators
    const internationalKeywords = [
      'internacional', 'exterior', 'fora do brasil', 'eua', 'usa', 'united states',
      'europa', 'europe', 'asia', 'africa', 'oceania', 'canada', 'mexico',
      'argentina', 'chile', 'colombia', 'peru', 'venezuela', 'uruguay', 'paraguay'
    ];
    
    const hasInternationalKeyword = internationalKeywords.some(keyword =>
      normalizedDestination.includes(keyword)
    );
    
    return !isBrazilianCity || hasInternationalKeyword;
  }, []);

  return {
    query,
    isOpen,
    filteredCities,
    handleInputChange,
    handleCitySelect,
    handleClose,
    isInternationalDestination
  };
}