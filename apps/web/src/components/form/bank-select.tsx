'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBankAutocomplete, type BankOption } from '@/hooks/use-bank-autocomplete';

interface BankSelectProps {
  value?: string;
  onValueChange?: (value: string, option?: BankOption) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function BankSelect({
  value = '',
  onValueChange,
  placeholder = 'Selecione ou digite o nome do banco...',
  disabled = false,
  error
}: BankSelectProps) {
  const {
    options,
    loading,
    error: apiError,
    isOpen,
    setIsOpen,
    search,
    clearSearch
  } = useBankAutocomplete();

  const [inputValue, setInputValue] = useState(value);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Find selected bank option
  const selectedBank = options.find(bank => bank.value === value);

  const handleSelect = (selectedValue: string) => {
    const selectedOption = options.find(bank => bank.value === selectedValue);
    
    setInputValue(selectedValue);
    setIsOpen(false);
    clearSearch();
    
    if (onValueChange) {
      onValueChange(selectedValue, selectedOption);
    }
  };

  const handleInputChange = (searchValue: string) => {
    setInputValue(searchValue);
    search(searchValue);
    
    // If user is typing and it doesn't match exactly, call onValueChange with the typed value
    if (onValueChange && searchValue !== value) {
      onValueChange(searchValue);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    if (!open) {
      clearSearch();
    } else {
      // When opening, search with current input value
      if (inputValue) {
        search(inputValue);
      }
    }
  };

  const displayValue = selectedBank ? selectedBank.label : inputValue;
  const hasError = error || apiError;

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-left font-normal",
              !displayValue && "text-muted-foreground",
              hasError && "border-red-500 focus-visible:ring-red-500",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <div className="flex items-center">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Digite para pesquisar bancos..."
              value={inputValue}
              onValueChange={handleInputChange}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando bancos...</span>
                </div>
              )}
              
              {!loading && options.length === 0 && (
                <CommandEmpty>
                  {inputValue ? 'Nenhum banco encontrado.' : 'Carregando bancos...'}
                </CommandEmpty>
              )}
              
              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((bank) => (
                    <CommandItem
                      key={bank.code}
                      value={bank.value}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === bank.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{bank.label}</span>
                        <span className="text-xs text-muted-foreground">
                          Código: {bank.code}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Error message */}
      {hasError && (
        <p className="text-sm text-red-500">
          {error || apiError}
        </p>
      )}
    </div>
  );
}
