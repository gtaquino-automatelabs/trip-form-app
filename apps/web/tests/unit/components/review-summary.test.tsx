import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewSummary } from '@/components/form/review-summary';
import { useFormStore } from '@/stores/form-store';
import { useRouter } from 'next/navigation';

// Mock the stores and hooks
vi.mock('@/stores/form-store');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date) => '01/01/2024'),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

describe('ReviewSummary', () => {
  const mockSetCurrentPage = vi.fn();
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRouter as any).mockReturnValue(mockRouter);

    (useFormStore as any).mockReturnValue({
      formData: {
        // Page 1 data
        projectName: 'Projeto X',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        cpf: '123.456.789-00',
        rg: '12345678',
        rgIssuer: 'SSP-SP',
        birthDate: '1990-01-01',
        requestType: 'passages_per_diem',
        
        // Page 2 data
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: '2024-02-01',
        returnDate: '2024-02-05',
        transportType: 'air',
        
        // Page 3 data
        expenseTypes: ['passagem', 'hospedagem', 'alimentacao'],
        
        // Page 4 data
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 150,
        
        // Conditional data
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false,
      },
      setCurrentPage: mockSetCurrentPage,
    });
  });

  it('renders all summary sections for basic trip', () => {
    render(<ReviewSummary />);

    expect(screen.getByText('Resumo da Solicitação')).toBeInTheDocument();
    expect(screen.getByText('Dados do Passageiro')).toBeInTheDocument();
    expect(screen.getByText('Detalhes da Viagem')).toBeInTheDocument();
    expect(screen.getByText('Despesas e Preferências')).toBeInTheDocument();
  });

  it('displays passenger data correctly', () => {
    render(<ReviewSummary />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('12345678 / SSP-SP')).toBeInTheDocument();
    expect(screen.getByText('Projeto X')).toBeInTheDocument();
    expect(screen.getByText('Passagens e Diárias')).toBeInTheDocument();
  });

  it('displays travel details correctly', () => {
    render(<ReviewSummary />);

    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
    expect(screen.getByText('Aéreo')).toBeInTheDocument();
  });

  it('displays expense types as badges', () => {
    render(<ReviewSummary />);

    expect(screen.getByText('Passagem')).toBeInTheDocument();
    expect(screen.getByText('Hospedagem')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('displays preferences correctly', () => {
    render(<ReviewSummary />);

    expect(screen.getByText('Sim')).toBeInTheDocument(); // Baggage allowance
    expect(screen.getByText('Não')).toBeInTheDocument(); // Transport allowance
    expect(screen.getByText('R$ 150')).toBeInTheDocument(); // Daily allowance
  });

  it('shows international section when trip is international', () => {
    (useFormStore as any).mockReturnValue({
      formData: {
        ...useFormStore().formData,
        isInternational: true,
        destination: 'Buenos Aires, Argentina',
        passportNumber: 'AB123456',
        passportValidity: '2030-01-01',
        passportImageUrl: '/uploads/passport.jpg',
        visaRequired: true,
      },
      setCurrentPage: mockSetCurrentPage,
    });

    render(<ReviewSummary />);

    expect(screen.getByText('Viagem Internacional')).toBeInTheDocument();
    expect(screen.getByText('AB123456')).toBeInTheDocument();
    expect(screen.getByText('Enviado')).toBeInTheDocument(); // Passport image
  });

  it('shows time restrictions section when applicable', () => {
    (useFormStore as any).mockReturnValue({
      formData: {
        ...useFormStore().formData,
        hasTimeRestrictions: true,
        timeRestrictionDetails: 'Preciso retornar antes do dia 10',
      },
      setCurrentPage: mockSetCurrentPage,
    });

    render(<ReviewSummary />);

    expect(screen.getByText('Restrições de Horário')).toBeInTheDocument();
    expect(screen.getByText('Preciso retornar antes do dia 10')).toBeInTheDocument();
  });

  it('shows flight preferences section when applicable', () => {
    (useFormStore as any).mockReturnValue({
      formData: {
        ...useFormStore().formData,
        hasFlightPreferences: true,
        flightSuggestionFiles: [
          { fileName: 'flight1.pdf', fileUrl: '/uploads/flight1.pdf', fileSize: 1024, fileType: 'application/pdf' },
          { fileName: 'flight2.pdf', fileUrl: '/uploads/flight2.pdf', fileSize: 2048, fileType: 'application/pdf' },
        ],
        flightPreferences: 'Prefiro voos diretos',
      },
      setCurrentPage: mockSetCurrentPage,
    });

    render(<ReviewSummary />);

    expect(screen.getByText('Preferências de Voo')).toBeInTheDocument();
    expect(screen.getByText('2 arquivo(s)')).toBeInTheDocument();
    expect(screen.getByText('Prefiro voos diretos')).toBeInTheDocument();
  });

  it('handles edit button clicks correctly', () => {
    render(<ReviewSummary />);

    const editButtons = screen.getAllByText('Editar');
    
    // Click first edit button (Passenger Data - Page 1)
    fireEvent.click(editButtons[0]);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);

    // Click second edit button (Travel Details - Page 2)
    fireEvent.click(editButtons[1]);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

    // Click third edit button (Expenses - Page 3)
    fireEvent.click(editButtons[2]);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
  });

  it('displays helpful tip message', () => {
    render(<ReviewSummary />);
    
    expect(screen.getByText(/revise todas as informações antes de enviar/i)).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    (useFormStore as any).mockReturnValue({
      formData: {
        // Minimal data
        passengerName: undefined,
        origin: undefined,
        expenseTypes: undefined,
      },
      setCurrentPage: mockSetCurrentPage,
    });

    render(<ReviewSummary />);

    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0);
    expect(screen.getByText('Nenhum selecionado')).toBeInTheDocument();
  });

  it('formats request type correctly', () => {
    const testCases = [
      { type: 'passages_per_diem', expected: 'Passagens e Diárias' },
      { type: 'passages_only', expected: 'Somente Passagens' },
      { type: 'per_diem_only', expected: 'Somente Diárias' },
    ];

    testCases.forEach(({ type, expected }) => {
      (useFormStore as any).mockReturnValue({
        formData: { requestType: type },
        setCurrentPage: mockSetCurrentPage,
      });

      const { rerender } = render(<ReviewSummary />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      rerender(<ReviewSummary />);
    });
  });

  it('formats transport type correctly', () => {
    const testCases = [
      { type: 'air', expected: 'Aéreo' },
      { type: 'road', expected: 'Rodoviário' },
      { type: 'both', expected: 'Aéreo e Rodoviário' },
      { type: 'own_car', expected: 'Veículo Próprio' },
    ];

    testCases.forEach(({ type, expected }) => {
      (useFormStore as any).mockReturnValue({
        formData: { transportType: type },
        setCurrentPage: mockSetCurrentPage,
      });

      const { rerender } = render(<ReviewSummary />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      rerender(<ReviewSummary />);
    });
  });
});