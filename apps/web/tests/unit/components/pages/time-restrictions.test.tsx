import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TimeRestrictionsPage } from '@/components/form/pages/time-restrictions';

// Mock the form store
const mockUpdateFormData = vi.fn();
const mockFormData = {
  timeRestrictionDetails: ''
};

vi.mock('@/stores/form-store', () => ({
  useFormStore: () => ({
    formData: mockFormData,
    updateFormData: mockUpdateFormData
  })
}));

// Mock the validation hook
const mockValidateField = vi.fn();
vi.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validationErrors: {},
    validateField: mockValidateField
  })
}));

describe('TimeRestrictionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form elements', () => {
    render(<TimeRestrictionsPage />);
    
    expect(screen.getByText(/restrições de horário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/detalhes das restrições/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefiro voos diretos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evitar voos noturnos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/necessito chegar antes de/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/necessito partir após/i)).toBeInTheDocument();
  });

  it('updates restriction details when textarea changes', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const textarea = screen.getByLabelText(/detalhes das restrições/i);
    await user.type(textarea, 'Preciso chegar antes das 14h para reunião importante');
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      timeRestrictionDetails: 'Preciso chegar antes das 14h para reunião importante' 
    });
  });

  it('shows character count', () => {
    render(<TimeRestrictionsPage />);
    
    expect(screen.getByText(/0\/20 caracteres mínimos/i)).toBeInTheDocument();
  });

  it('shows warning when character count is below minimum', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const textarea = screen.getByLabelText(/detalhes das restrições/i);
    await user.type(textarea, 'Texto curto');
    
    expect(screen.getByText(/por favor, forneça mais detalhes/i)).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const textarea = screen.getByLabelText(/detalhes das restrições/i);
    await user.type(textarea, 'Test text with exactly twenty characters');
    
    // Should show updated character count
    expect(screen.getByText(/39\/20 caracteres mínimos/i)).toBeInTheDocument();
  });

  it('handles direct flights checkbox', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const directFlightsCheckbox = screen.getByLabelText(/prefiro voos diretos/i);
    await user.click(directFlightsCheckbox);
    
    // Should auto-populate textarea
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      timeRestrictionDetails: expect.stringContaining('Prefiro voos diretos')
    });
  });

  it('handles avoid night flights checkbox', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const avoidNightFlightsCheckbox = screen.getByLabelText(/evitar voos noturnos/i);
    await user.click(avoidNightFlightsCheckbox);
    
    // Should auto-populate textarea
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      timeRestrictionDetails: expect.stringContaining('Evitar voos noturnos')
    });
  });

  it('shows time input when arrival time restriction is checked', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const arrivalTimeCheckbox = screen.getByLabelText(/necessito chegar antes de/i);
    await user.click(arrivalTimeCheckbox);
    
    // Time input should appear
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('shows time input when departure time restriction is checked', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    const departureTimeCheckbox = screen.getByLabelText(/necessito partir após/i);
    await user.click(departureTimeCheckbox);
    
    // Time input should appear
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('combines multiple restriction options in textarea', async () => {
    const user = userEvent.setup();
    render(<TimeRestrictionsPage />);
    
    // Check multiple options
    const directFlightsCheckbox = screen.getByLabelText(/prefiro voos diretos/i);
    const avoidNightFlightsCheckbox = screen.getByLabelText(/evitar voos noturnos/i);
    
    await user.click(directFlightsCheckbox);
    await user.click(avoidNightFlightsCheckbox);
    
    // Should combine both options
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      timeRestrictionDetails: expect.stringContaining('Prefiro voos diretos. Evitar voos noturnos')
    });
  });

  it('validates minimum character requirement', () => {
    const formDataWithShortText = {
      timeRestrictionDetails: 'Short'
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithShortText,
      updateFormData: mockUpdateFormData
    });

    render(<TimeRestrictionsPage />);
    
    expect(screen.getByText(/5\/20 caracteres mínimos/i)).toBeInTheDocument();
    expect(screen.getByText(/por favor, forneça mais detalhes/i)).toBeInTheDocument();
  });

  it('shows success state when minimum characters are met', () => {
    const formDataWithValidText = {
      timeRestrictionDetails: 'This is a valid restriction description with enough characters'
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithValidText,
      updateFormData: mockUpdateFormData
    });

    render(<TimeRestrictionsPage />);
    
    // Should not show warning message
    expect(screen.queryByText(/por favor, forneça mais detalhes/i)).not.toBeInTheDocument();
  });
});