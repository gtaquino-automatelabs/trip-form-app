import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseTypesPage } from '@/components/form/pages/expense-types';
import { useFormStore } from '@/stores/form-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the form store
vi.mock('@/stores/form-store');
const mockUseFormStore = vi.mocked(useFormStore);

describe('ExpenseTypesPage', () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormStore.mockReturnValue({
      formData: {
        expenseTypes: [],
        otherExpenseDescription: '',
      },
      updateFormData: mockUpdateFormData,
      currentPage: 3,
      visitedPages: [1, 2, 3],
      setCurrentPage: vi.fn(),
      markPageVisited: vi.fn(),
      clearFormData: vi.fn(),
      resetNavigation: vi.fn(),
      canNavigateToPage: vi.fn(),
      getNextAvailablePage: vi.fn(),
      getPreviousAvailablePage: vi.fn(),
    });
  });

  it('should render expense type checkboxes', () => {
    render(<ExpenseTypesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    expect(screen.getByLabelText(/hospedagem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alimentação/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/transporte local/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/inscrição em evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outras despesas/i)).toBeInTheDocument();
  });

  it('should show other expense description field when "other" is selected', async () => {
    const user = userEvent.setup();
    render(<ExpenseTypesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const otherCheckbox = screen.getByLabelText(/outras despesas/i);
    await user.click(otherCheckbox);

    await waitFor(() => {
      expect(screen.getByLabelText(/especifique outras despesas/i)).toBeInTheDocument();
    });
  });

  it('should validate at least one expense type is selected', async () => {
    render(<ExpenseTypesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/selecione pelo menos um tipo de despesa/i)).toBeInTheDocument();
    });
  });

  it('should validate other expense description when other is selected', async () => {
    const user = userEvent.setup();
    render(<ExpenseTypesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const otherCheckbox = screen.getByLabelText(/outras despesas/i);
    await user.click(otherCheckbox);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/especifique as outras despesas/i)).toBeInTheDocument();
    });
  });

  it('should allow multiple expense type selections', async () => {
    const user = userEvent.setup();
    render(<ExpenseTypesPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const accommodationCheckbox = screen.getByLabelText(/hospedagem/i);
    const mealsCheckbox = screen.getByLabelText(/alimentação/i);

    await user.click(accommodationCheckbox);
    await user.click(mealsCheckbox);

    expect(accommodationCheckbox).toBeChecked();
    expect(mealsCheckbox).toBeChecked();
  });
});