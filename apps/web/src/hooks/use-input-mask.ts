import { useState, useCallback } from 'react';

export type MaskType = 'cpf' | 'phone' | 'date';

export function useInputMask(type: MaskType) {
  const [value, setValue] = useState('');

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return value.slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        // Landline: (XX) XXXX-XXXX
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .replace(/(-\d{4})\d+?$/, '$1');
      } else {
        // Mobile: (XX) XXXXX-XXXX
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .replace(/(-\d{4})\d+?$/, '$1');
      }
    }
    return value.slice(0, 15);
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\/\d{4})\d+?$/, '$1');
    }
    return value.slice(0, 10);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let formatted = inputValue;

    switch (type) {
      case 'cpf':
        formatted = formatCPF(inputValue);
        break;
      case 'phone':
        formatted = formatPhone(inputValue);
        break;
      case 'date':
        formatted = formatDate(inputValue);
        break;
    }

    setValue(formatted);
    e.target.value = formatted;
  }, [type]);

  const getRawValue = useCallback(() => {
    return value.replace(/\D/g, '');
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    getRawValue,
  };
}