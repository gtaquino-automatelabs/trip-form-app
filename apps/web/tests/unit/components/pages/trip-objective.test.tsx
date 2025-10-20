import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TripObjectivePage } from '@/components/form/pages/trip-objective';
import { useFormStore } from '@/stores/form-store';
import { useFormValidation } from '@/hooks/useFormValidation';

// Mock the stores and hooks
vi.mock('@/stores/form-store');
vi.mock('@/hooks/useFormValidation');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the ReviewSummary component
vi.mock('@/components/form/review-summary', () => ({
  ReviewSummary: () => <div data-testid="review-summary">Review Summary</div>,
}));

describe('TripObjectivePage', () => {
  const mockUpdateFormData = vi.fn();
  const mockValidateField = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useFormStore as any).mockReturnValue({
      formData: {
        tripObjective: '',
        observations: '',
        isUrgent: false,
        urgentJustification: '',
      },
      updateFormData: mockUpdateFormData,
    });

    (useFormValidation as any).mockReturnValue({
      validationErrors: {},
      validateField: mockValidateField,
    });
  });

  it('renders all form fields correctly', () => {
    render(<TripObjectivePage />);

    expect(screen.getByLabelText(/objetivo da viagem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observações adicionais/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/solicitação urgente/i)).toBeInTheDocument();
    expect(screen.getByTestId('review-summary')).toBeInTheDocument();
  });

  it('updates trip objective and shows character count', async () => {
    render(<TripObjectivePage />);

    const objectiveTextarea = screen.getByPlaceholderText(/descreva o objetivo desta viagem/i);
    
    fireEvent.change(objectiveTextarea, {
      target: { value: 'Participar de conferência internacional sobre tecnologia' },
    });

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        tripObjective: 'Participar de conferência internacional sobre tecnologia',
      });
      expect(mockValidateField).toHaveBeenCalledWith(
        'tripObjective',
        'Participar de conferência internacional sobre tecnologia'
      );
    });

    // Check character count display
    expect(screen.getByText(/56\/50 caracteres/i)).toBeInTheDocument();
  });

  it('shows warning when trip objective is below minimum characters', () => {
    render(<TripObjectivePage />);

    const objectiveTextarea = screen.getByPlaceholderText(/descreva o objetivo desta viagem/i);
    
    fireEvent.change(objectiveTextarea, {
      target: { value: 'Viagem curta' },
    });

    expect(screen.getByText(/12\/50 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/por favor, forneça mais detalhes/i)).toBeInTheDocument();
  });

  it('limits observations to 500 characters', () => {
    render(<TripObjectivePage />);

    const observationsTextarea = screen.getByPlaceholderText(/informações adicionais relevantes/i);
    const longText = 'a'.repeat(600);
    
    fireEvent.change(observationsTextarea, {
      target: { value: longText },
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      observations: 'a'.repeat(500),
    });
  });

  it('shows urgent justification field when urgent is checked', async () => {
    render(<TripObjectivePage />);

    const urgentCheckbox = screen.getByRole('checkbox', { name: /solicitação urgente/i });
    
    // Initially, urgent justification should not be visible
    expect(screen.queryByLabelText(/justificativa da urgência/i)).not.toBeInTheDocument();

    // Check the urgent checkbox
    fireEvent.click(urgentCheckbox);

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({ isUrgent: true });
    });

    // Re-render with updated state
    (useFormStore as any).mockReturnValue({
      formData: {
        tripObjective: '',
        observations: '',
        isUrgent: true,
        urgentJustification: '',
      },
      updateFormData: mockUpdateFormData,
    });

    render(<TripObjectivePage />);

    // Now urgent justification should be visible
    expect(screen.getByLabelText(/justificativa da urgência/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitações urgentes requerem justificativa/i)).toBeInTheDocument();
  });

  it('validates urgent justification when urgent is selected', async () => {
    (useFormStore as any).mockReturnValue({
      formData: {
        tripObjective: '',
        observations: '',
        isUrgent: true,
        urgentJustification: '',
      },
      updateFormData: mockUpdateFormData,
    });

    render(<TripObjectivePage />);

    const urgentJustification = screen.getByPlaceholderText(/explique detalhadamente o motivo/i);
    
    fireEvent.change(urgentJustification, {
      target: { value: 'Urgente devido a mudança de data' },
    });

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        urgentJustification: 'Urgente devido a mudança de data',
      });
      expect(mockValidateField).toHaveBeenCalledWith(
        'urgentJustification',
        'Urgente devido a mudança de data'
      );
    });

    // Check character count for urgent justification
    expect(screen.getByText(/33\/30 caracteres/i)).toBeInTheDocument();
  });

  it('displays validation errors correctly', () => {
    (useFormValidation as any).mockReturnValue({
      validationErrors: {
        tripObjective: 'Objetivo deve ter no mínimo 50 caracteres',
        urgentJustification: 'Justificativa deve ter no mínimo 30 caracteres',
      },
      validateField: mockValidateField,
    });

    (useFormStore as any).mockReturnValue({
      formData: {
        tripObjective: 'Objetivo curto',
        observations: '',
        isUrgent: true,
        urgentJustification: 'Urgente',
      },
      updateFormData: mockUpdateFormData,
    });

    render(<TripObjectivePage />);

    expect(screen.getByText('Objetivo deve ter no mínimo 50 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Justificativa deve ter no mínimo 30 caracteres')).toBeInTheDocument();
  });

  it('renders ReviewSummary component', () => {
    render(<TripObjectivePage />);
    expect(screen.getByTestId('review-summary')).toBeInTheDocument();
  });
});