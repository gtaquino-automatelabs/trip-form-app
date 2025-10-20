import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationPage from '@/app/confirmation/page';
import { useFormStore } from '@/stores/form-store';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock the form store
vi.mock('@/stores/form-store', () => ({
  useFormStore: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  } as Response)
);

describe('ConfirmationPage', () => {
  const mockPush = vi.fn();
  const mockGet = vi.fn();
  const mockClearFormData = vi.fn();
  const mockClearUploadedFiles = vi.fn();
  const mockResetSubmissionState = vi.fn();

  const mockFormData = {
    projectName: 'Test Project',
    passengerName: 'João Silva',
    passengerEmail: 'joao@example.com',
    phone: '11999999999',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    rgIssuer: 'SSP-SP',
    birthDate: '1990-01-01',
    bankDetails: 'Banco XYZ - Ag 1234 - CC 56789',
    requestType: 'passages_per_diem',
    origin: 'São Paulo',
    destination: 'Rio de Janeiro',
    departureDate: '2025-02-01',
    returnDate: '2025-02-05',
    transportType: 'air',
    isInternational: false,
    isUrgent: false,
    expenseTypes: ['accommodation', 'food'],
    baggageAllowance: true,
    transportAllowance: false,
    estimatedDailyAllowance: 150,
    tripObjective: 'Reunião com cliente importante',
    observations: 'Precisa de hotel próximo ao centro',
  };

  const mockUploadedFiles = {
    passport: undefined,
    flights: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    
    (useSearchParams as any).mockReturnValue({
      get: mockGet,
    });
    
    (useFormStore as any).mockReturnValue({
      formData: mockFormData,
      lastSubmissionId: 'REQ-2025-ABC123',
      clearFormData: mockClearFormData,
      clearUploadedFiles: mockClearUploadedFiles,
      resetSubmissionState: mockResetSubmissionState,
      uploadedFiles: mockUploadedFiles,
    });

    mockGet.mockReturnValue('REQ-2025-ABC123');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render confirmation page with success message', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Solicitação Enviada com Sucesso!')).toBeInTheDocument();
    });
  });

  it('should display request reference number prominently', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('REQ-2025-ABC123')).toBeInTheDocument();
      expect(screen.getByText('Número de Referência')).toBeInTheDocument();
    });
  });

  it('should format and display personal information', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
      // Use getAllByText since email appears multiple times (in personal info and in email notification message)
      const emailElements = screen.getAllByText(/joao@example.com/);
      expect(emailElements.length).toBeGreaterThanOrEqual(1);
      expect(emailElements[0]).toBeInTheDocument(); // Check first occurrence (in personal info section)
      expect(screen.getByText(/11999999999/)).toBeInTheDocument();
      expect(screen.getByText(/123.456.789-00/)).toBeInTheDocument();
    });
  });

  it('should format and display travel details', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detalhes da Viagem')).toBeInTheDocument();
      expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
      expect(screen.getByText(/Rio de Janeiro/)).toBeInTheDocument();
      // Check for date in DD/MM/YYYY format (timezone-agnostic)
      // Could be 31/01/2025 or 01/02/2025 depending on timezone
      expect(screen.getByText(/(31\/01\/2025|01\/02\/2025)/)).toBeInTheDocument();
      expect(screen.getByText(/(04\/02\/2025|05\/02\/2025)/)).toBeInTheDocument();
    });
  });

  it('should display Brazilian formatted timestamp', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const timestampElement = screen.getByText(/Data\/Hora:/);
      expect(timestampElement).toBeInTheDocument();
      // Check if date is in Brazilian format (DD/MM/YYYY)
      expect(timestampElement.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  it('should handle print button click', async () => {
    const mockPrint = vi.fn();
    window.print = mockPrint;
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const printButton = screen.getByRole('button', { name: /Imprimir/i });
      fireEvent.click(printButton);
      expect(mockPrint).toHaveBeenCalled();
    });
  });

  it('should show confirmation dialog when clicking Nova Solicitação', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const newRequestButton = screen.getByRole('button', { name: /Nova Solicitação/i });
      fireEvent.click(newRequestButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Confirmar Nova Solicitação/)).toBeInTheDocument();
      expect(screen.getByText(/todos os dados do formulário atual serão limpos/)).toBeInTheDocument();
    });
  });

  it('should clear store and navigate when confirming new request', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const newRequestButton = screen.getByRole('button', { name: /Nova Solicitação/i });
      fireEvent.click(newRequestButton);
    });
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Sim, criar nova/i });
      fireEvent.click(confirmButton);
    });
    
    expect(mockClearFormData).toHaveBeenCalled();
    expect(mockClearUploadedFiles).toHaveBeenCalled();
    expect(mockResetSubmissionState).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/form');
  });

  it('should navigate to home when clicking Início button', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const homeButton = screen.getByRole('button', { name: /Início/i });
      fireEvent.click(homeButton);
    });
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should send email confirmation on mount', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-confirmation-email',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('REQ-2025-ABC123'),
        })
      );
    });
  });

  it('should display expense information correctly', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Informações de Despesas')).toBeInTheDocument();
      expect(screen.getByText(/Hospedagem, Alimentação/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 150/)).toBeInTheDocument();
    });
  });

  it('should display trip objective', async () => {
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Objetivo da Viagem')).toBeInTheDocument();
      expect(screen.getByText(/Reunião com cliente importante/)).toBeInTheDocument();
      expect(screen.getByText(/Precisa de hotel próximo ao centro/)).toBeInTheDocument();
    });
  });

  it('should show passport information for international trips', async () => {
    const internationalFormData = {
      ...mockFormData,
      isInternational: true,
      destination: 'Lisboa, Portugal',
      passportNumber: 'AB123456',
      passportValidity: '2030-12-31',
      visaRequired: false,
    };
    
    (useFormStore as any).mockReturnValue({
      formData: internationalFormData,
      lastSubmissionId: 'REQ-2025-ABC123',
      clearFormData: mockClearFormData,
      clearUploadedFiles: mockClearUploadedFiles,
      resetSubmissionState: mockResetSubmissionState,
      uploadedFiles: mockUploadedFiles,
    });
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Informações de Passaporte')).toBeInTheDocument();
      expect(screen.getByText(/AB123456/)).toBeInTheDocument();
      // Check for date in DD/MM/YYYY format (timezone-agnostic)
      // Could be 30/12/2030 or 31/12/2030 depending on timezone
      expect(screen.getByText(/(30\/12\/2030|31\/12\/2030)/)).toBeInTheDocument();
    });
  });

  it('should display attached files when present', async () => {
    const filesUploadedData = {
      passport: {
        fileName: 'passport.jpg',
        fileUrl: '/uploads/passport.jpg',
        fileSize: 1024,
        fileType: 'image/jpeg',
      },
      flights: [
        {
          fileName: 'flight-suggestion.pdf',
          fileUrl: '/uploads/flight.pdf',
          fileSize: 2048,
          fileType: 'application/pdf',
        },
      ],
    };
    
    (useFormStore as any).mockReturnValue({
      formData: mockFormData,
      lastSubmissionId: 'REQ-2025-ABC123',
      clearFormData: mockClearFormData,
      clearUploadedFiles: mockClearUploadedFiles,
      resetSubmissionState: mockResetSubmissionState,
      uploadedFiles: filesUploadedData,
    });
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Arquivos Anexados')).toBeInTheDocument();
      expect(screen.getByText(/Imagem do Passaporte/)).toBeInTheDocument();
      expect(screen.getByText(/flight-suggestion.pdf/)).toBeInTheDocument();
    });
  });

  it('should show no confirmation data message when no data available', async () => {
    mockGet.mockReturnValue(null);
    
    (useFormStore as any).mockReturnValue({
      formData: null,
      lastSubmissionId: null,
      clearFormData: mockClearFormData,
      clearUploadedFiles: mockClearUploadedFiles,
      resetSubmissionState: mockResetSubmissionState,
      uploadedFiles: mockUploadedFiles,
    });
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhuma informação de confirmação encontrada.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Voltar ao Formulário/i })).toBeInTheDocument();
    });
  });

  it('should navigate to form when no data and clicking back button', async () => {
    mockGet.mockReturnValue(null);
    
    (useFormStore as any).mockReturnValue({
      formData: null,
      lastSubmissionId: null,
      clearFormData: mockClearFormData,
      clearUploadedFiles: mockClearUploadedFiles,
      resetSubmissionState: mockResetSubmissionState,
      uploadedFiles: mockUploadedFiles,
    });
    
    render(<ConfirmationPage />);
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /Voltar ao Formulário/i });
      fireEvent.click(backButton);
    });
    
    expect(mockPush).toHaveBeenCalledWith('/form');
  });
});