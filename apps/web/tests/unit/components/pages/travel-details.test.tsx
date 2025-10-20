import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelDetailsPage } from '@/components/form/pages/travel-details';
import { useFormStore } from '@/stores/form-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the form store
vi.mock('@/stores/form-store');
const mockUseFormStore = vi.mocked(useFormStore);

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return '2025-01-15';
    }
    return date.toISOString();
  })
}));

describe('TravelDetailsPage', () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormStore.mockReturnValue({
      formData: {
        origin: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        transportType: 'air',
      },
      updateFormData: mockUpdateFormData,
      currentPage: 2,
      visitedPages: [1, 2],
      setCurrentPage: vi.fn(),
      markPageVisited: vi.fn(),
      clearFormData: vi.fn(),
      resetNavigation: vi.fn(),
      canNavigateToPage: vi.fn(),
      getNextAvailablePage: vi.fn(),
      getPreviousAvailablePage: vi.fn(),
    });
  });

  it('should render form fields correctly', () => {
    render(<TravelDetailsPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    expect(screen.getByLabelText(/cidade de origem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade de destino/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de ida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de volta/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo de transporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aéreo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rodoviário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ambos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carro próprio/i)).toBeInTheDocument();
  });

  it('should show city suggestions when typing', async () => {
    const user = userEvent.setup();
    render(<TravelDetailsPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const originInput = screen.getByLabelText(/cidade de origem/i);
    await user.type(originInput, 'São');

    await waitFor(() => {
      expect(screen.getByText('São Paulo - SP')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<TravelDetailsPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    // Try to submit without filling required fields
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/campo obrigatório/i)).toHaveLength(2); // Origin and destination
    });
  });

  it('should validate date order', async () => {
    const user = userEvent.setup();
    render(<TravelDetailsPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const departureInput = screen.getByLabelText(/data de ida/i);
    const returnInput = screen.getByLabelText(/data de volta/i);

    await user.type(departureInput, '2025-01-20');
    await user.type(returnInput, '2025-01-15'); // Earlier than departure

    await waitFor(() => {
      expect(screen.getByText(/a data de volta deve ser igual ou posterior à data de ida/i)).toBeInTheDocument();
    });
  });

  it('should handle transport type selection', async () => {
    const user = userEvent.setup();
    render(<TravelDetailsPage onNext={mockOnNext} onPrevious={mockOnPrevious} />);

    const roadOption = screen.getByLabelText(/rodoviário/i);
    await user.click(roadOption);

    expect(roadOption).toBeChecked();
  });
});