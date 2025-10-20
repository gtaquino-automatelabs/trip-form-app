import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesPage } from '@/components/form/pages/preferences';
import { useFormStore } from '@/stores/form-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the form store
vi.mock('@/stores/form-store');
const mockUseFormStore = vi.mocked(useFormStore);

// Mock date-fns differenceInDays function
vi.mock('date-fns', () => ({
  differenceInDays: vi.fn(() => 5) // Mock 5 days difference
}));

describe('PreferencesPage', () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormStore.mockReturnValue({
      formData: {
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 0,
        departureDate: '2025-01-15',
        returnDate: '2025-01-20',
      },
      updateFormData: mockUpdateFormData,
      currentPage: 4,
      visitedPages: [1, 2, 3, 4],
      setCurrentPage: vi.fn(),
      markPageVisited: vi.fn(),
      clearFormData: vi.fn(),
      resetNavigation: vi.fn(),
      canNavigateToPage: vi.fn(),
      getNextAvailablePage: vi.fn(),
      getPreviousAvailablePage: vi.fn(),
    });
  });

  it('should render preference fields correctly', () => {
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    expect(screen.getByLabelText(/necessita de franquia de bagagem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/necessita de auxílio transporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimativa de diárias/i)).toBeInTheDocument();
  });

  it('should handle baggage allowance checkbox', async () => {
    const user = userEvent.setup();
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const baggageCheckbox = screen.getByLabelText(/necessita de franquia de bagagem/i);
    
    // Should be checked by default
    expect(baggageCheckbox).toBeChecked();

    await user.click(baggageCheckbox);
    expect(baggageCheckbox).not.toBeChecked();
  });

  it('should handle transport allowance checkbox', async () => {
    const user = userEvent.setup();
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const transportCheckbox = screen.getByLabelText(/necessita de auxílio transporte/i);
    
    // Should be unchecked by default
    expect(transportCheckbox).not.toBeChecked();

    await user.click(transportCheckbox);
    expect(transportCheckbox).toBeChecked();
  });

  it('should validate daily allowance input', async () => {
    const user = userEvent.setup();
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const dailyAllowanceInput = screen.getByLabelText(/estimativa de diárias/i);
    
    // Clear input and try to submit
    await user.clear(dailyAllowanceInput);
    await user.type(dailyAllowanceInput, '0');

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/o valor deve ser maior que zero/i)).toBeInTheDocument();
    });
  });

  it('should validate maximum daily allowance', async () => {
    const user = userEvent.setup();
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const dailyAllowanceInput = screen.getByLabelText(/estimativa de diárias/i);
    
    await user.clear(dailyAllowanceInput);
    await user.type(dailyAllowanceInput, '400'); // Over 365 limit

    await waitFor(() => {
      expect(screen.getByText(/o número de diárias não pode exceder 365 dias/i)).toBeInTheDocument();
    });
  });

  it('should show calculated days hint when dates are available', () => {
    render(<PreferencesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    expect(screen.getByText(/calculado automaticamente: 6 dias/i)).toBeInTheDocument();
  });
});