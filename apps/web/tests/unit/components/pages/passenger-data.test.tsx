import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassengerDataPage } from '@/components/form/pages/passenger-data';
import { useFormStore } from '@/stores/form-store';

// Mock the form store
vi.mock('@/stores/form-store', () => ({
  useFormStore: vi.fn(),
}));

// Mock date-fns format to avoid timezone issues
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }),
}));

describe('PassengerDataPage', () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    (useFormStore as any).mockReturnValue({
      formData: {},
      updateFormData: mockUpdateFormData,
    });
  });

  it('renders all required fields', () => {
    render(<PassengerDataPage />);

    // Check for all field labels
    expect(screen.getByText(/Projeto Vinculado/)).toBeInTheDocument();
    expect(screen.getByText(/Nome do Passageiro/)).toBeInTheDocument();
    expect(screen.getByText(/E-mail do Passageiro/)).toBeInTheDocument();
    expect(screen.getByText(/RG/)).toBeInTheDocument();
    expect(screen.getByText(/Órgão Expedidor/)).toBeInTheDocument();
    expect(screen.getByText(/CPF/)).toBeInTheDocument();
    expect(screen.getByText(/Data de Nascimento/)).toBeInTheDocument();
    expect(screen.getByText(/Telefone/)).toBeInTheDocument();
    expect(screen.getByText(/Dados Bancários/)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Solicitação/)).toBeInTheDocument();
  });

  it('loads existing form data from store', () => {
    const existingData = {
      projectName: 'Projeto Alpha',
      passengerName: 'João Silva',
      passengerEmail: 'joao@example.com',
      rg: '123456789',
      rgIssuer: 'SSP/SP',
      cpf: '12345678901',
      birthDate: '2000-01-01T00:00:00.000Z',
      phone: '11987654321',
      bankDetails: 'Banco do Brasil, Agência 1234, Conta 56789-0',
      requestType: 'passages_per_diem',
    };

    (useFormStore as any).mockReturnValue({
      formData: existingData,
      updateFormData: mockUpdateFormData,
    });

    render(<PassengerDataPage />);

    // Check if fields are populated
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SSP/SP')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<PassengerDataPage onNext={mockOnNext} />);

    // Try to submit without filling required fields
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getAllByText('Campo obrigatório').length).toBeGreaterThan(0);
    });

    // Verify onNext was not called
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<PassengerDataPage />);
    
    const emailInput = screen.getByPlaceholderText('seu.email@exemplo.com');
    
    // Enter invalid email
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    });
  });

  it('formats CPF correctly', async () => {
    render(<PassengerDataPage />);
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    
    // Type CPF numbers
    await userEvent.type(cpfInput, '12345678901');
    
    // Check if it's formatted
    expect(cpfInput).toHaveValue('123.456.789-01');
  });

  it('validates CPF checksum', async () => {
    render(<PassengerDataPage />);
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    
    // Enter invalid CPF (all same digits)
    await userEvent.type(cpfInput, '11111111111');
    fireEvent.blur(cpfInput);

    await waitFor(() => {
      expect(screen.getByText('CPF inválido')).toBeInTheDocument();
    });
  });

  it('formats phone correctly for mobile', async () => {
    render(<PassengerDataPage />);
    
    const phoneInput = screen.getByPlaceholderText('(00) 00000-0000');
    
    // Type mobile number
    await userEvent.type(phoneInput, '11987654321');
    
    // Check if it's formatted
    expect(phoneInput).toHaveValue('(11) 98765-4321');
  });

  it('formats phone correctly for landline', async () => {
    render(<PassengerDataPage />);
    
    const phoneInput = screen.getByPlaceholderText('(00) 00000-0000');
    
    // Type landline number
    await userEvent.type(phoneInput, '1134567890');
    
    // Check if it's formatted
    expect(phoneInput).toHaveValue('(11) 3456-7890');
  });

  it('validates minimum age of 18 years', async () => {
    render(<PassengerDataPage />);
    
    const dateInput = screen.getByLabelText(/Data de Nascimento/);
    
    // Set date to make person under 18
    const today = new Date();
    const underAge = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const dateString = underAge.toISOString().split('T')[0];
    
    fireEvent.change(dateInput, { target: { value: dateString } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(screen.getByText('Idade mínima de 18 anos')).toBeInTheDocument();
    });
  });

  it('validates bank details minimum length', async () => {
    render(<PassengerDataPage />);
    
    const bankDetailsInput = screen.getByPlaceholderText('Informe banco, agência, conta e tipo de conta');
    
    // Enter too short bank details
    await userEvent.type(bankDetailsInput, 'Banco');
    fireEvent.blur(bankDetailsInput);

    await waitFor(() => {
      expect(screen.getByText('Informe banco, agência, conta e tipo de conta')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<PassengerDataPage onNext={mockOnNext} />);
    
    // Fill in all required fields with valid data
    const projectTrigger = screen.getByRole('combobox');
    fireEvent.click(projectTrigger);
    
    // Wait for dropdown to open and select an option
    await waitFor(() => {
      const options = screen.getAllByText('Projeto Alpha');
      // Select the visible option in the dropdown (usually the second one)
      const visibleOption = options.find(el => el.closest('[role="option"]')) || options[1];
      fireEvent.click(visibleOption);
    });

    await userEvent.type(screen.getByPlaceholderText('Digite seu nome completo'), 'João da Silva');
    await userEvent.type(screen.getByPlaceholderText('seu.email@exemplo.com'), 'joao@example.com');
    await userEvent.type(screen.getByPlaceholderText('Digite seu RG'), '123456789');
    await userEvent.type(screen.getByPlaceholderText('Ex: SSP/SP'), 'SSP/SP');
    await userEvent.type(screen.getByPlaceholderText('000.000.000-00'), '52998224725'); // Valid CPF
    
    const dateInput = screen.getByLabelText(/Data de Nascimento/);
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });
    
    await userEvent.type(screen.getByPlaceholderText('(00) 00000-0000'), '11987654321');
    await userEvent.type(
      screen.getByPlaceholderText('Informe banco, agência, conta e tipo de conta'),
      'Banco do Brasil, Agência 1234, Conta 56789-0, Conta Corrente'
    );

    // Select request type
    const radioOption = screen.getByLabelText('Passagens e Diárias');
    fireEvent.click(radioOption);

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: 'Projeto Alpha',
          passengerName: 'João da Silva',
          passengerEmail: 'joao@example.com',
          rg: '123456789',
          rgIssuer: 'SSP/SP',
          cpf: '52998224725', // Raw CPF without formatting
          phone: '11987654321', // Raw phone without formatting
          requestType: 'passages_per_diem',
        })
      );
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('handles all request type options', async () => {
    render(<PassengerDataPage />);

    // Check all radio options are present
    expect(screen.getByLabelText('Passagens e Diárias')).toBeInTheDocument();
    expect(screen.getByLabelText('Apenas Passagens')).toBeInTheDocument();
    expect(screen.getByLabelText('Apenas Diárias')).toBeInTheDocument();

    // Test selecting each option
    const passagesOnly = screen.getByLabelText('Apenas Passagens');
    fireEvent.click(passagesOnly);
    expect(passagesOnly).toBeChecked();

    const perDiemOnly = screen.getByLabelText('Apenas Diárias');
    fireEvent.click(perDiemOnly);
    expect(perDiemOnly).toBeChecked();
  });
});