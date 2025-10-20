import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InternationalTravelPage } from '@/components/form/pages/international-travel';

// Mock the form store
const mockUpdateFormData = vi.fn();
let mockFormData = {
  passportNumber: '',
  passportValidity: '',
  passportImageUrl: undefined,
  visaRequired: false,
  departureDate: '2024-12-01'
};

const mockUseFormStore = vi.fn(() => ({
  formData: mockFormData,
  updateFormData: mockUpdateFormData
}));

vi.mock('@/stores/form-store', () => ({
  useFormStore: mockUseFormStore
}));

// Mock the validation hook
const mockValidateField = vi.fn();
vi.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validationErrors: {},
    validateField: mockValidateField
  })
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}));

// Mock fetch for file upload
global.fetch = vi.fn();

describe('InternationalTravelPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required fields', () => {
    render(<InternationalTravelPage />);
    
    expect(screen.getByLabelText(/número do passaporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/validade do passaporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/foto do passaporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/visto necessário/i)).toBeInTheDocument();
  });

  it('updates passport number when input changes', async () => {
    const user = userEvent.setup();
    render(<InternationalTravelPage />);
    
    const passportInput = screen.getByLabelText(/número do passaporte/i);
    await user.type(passportInput, 'AB123456');
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ passportNumber: 'AB123456' });
  });

  it('updates passport validity when date changes', async () => {
    const user = userEvent.setup();
    render(<InternationalTravelPage />);
    
    const validityInput = screen.getByLabelText(/validade do passaporte/i);
    await user.type(validityInput, '2025-12-01');
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ passportValidity: '2025-12-01' });
  });

  it('toggles visa requirement checkbox', async () => {
    const user = userEvent.setup();
    render(<InternationalTravelPage />);
    
    const visaCheckbox = screen.getByLabelText(/visto necessário/i);
    await user.click(visaCheckbox);
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ visaRequired: true });
  });

  it('shows passport validity warning when expiry is less than 6 months from travel', () => {
    // Set passport validity to 3 months from travel date
    const formDataWithShortValidity = {
      ...mockFormData,
      passportValidity: '2024-12-31', // Only 1 month after travel date
      departureDate: '2024-12-01'
    };

    mockFormData = formDataWithShortValidity;
    mockUseFormStore.mockReturnValue({
      formData: formDataWithShortValidity,
      updateFormData: mockUpdateFormData
    });

    render(<InternationalTravelPage />);
    
    expect(screen.getByText(/passaporte deve ser válido por pelo menos 6 meses/i)).toBeInTheDocument();
  });

  it('handles file upload successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        fileUrl: 'https://example.com/passport.jpg',
        fileName: 'passport.jpg',
        fileSize: 1024
      })
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
    
    render(<InternationalTravelPage />);
    
    const fileInput = screen.getByLabelText(/foto do passaporte/i);
    const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload/passport', expect.any(Object));
    });
    
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({ 
        passportImageUrl: 'https://example.com/passport.jpg' 
      });
    });
  });

  it('handles file upload error', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: 'Arquivo muito grande'
      })
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
    
    render(<InternationalTravelPage />);
    
    const fileInput = screen.getByLabelText(/foto do passaporte/i);
    const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/arquivo muito grande/i)).toBeInTheDocument();
    });
  });

  it('shows file preview after successful upload', async () => {
    const formDataWithImage = {
      ...mockFormData,
      passportImageUrl: 'https://example.com/passport.jpg'
    };

    mockFormData = formDataWithImage;
    mockUseFormStore.mockReturnValue({
      formData: formDataWithImage,
      updateFormData: mockUpdateFormData
    });

    render(<InternationalTravelPage />);
    
    expect(screen.getByText(/arquivo enviado com sucesso/i)).toBeInTheDocument();
    expect(screen.getByAltText(/preview do passaporte/i)).toBeInTheDocument();
  });

  it('allows removing uploaded image', async () => {
    const user = userEvent.setup();
    const formDataWithImage = {
      ...mockFormData,
      passportImageUrl: 'https://example.com/passport.jpg'
    };

    mockFormData = formDataWithImage;
    mockUseFormStore.mockReturnValue({
      formData: formDataWithImage,
      updateFormData: mockUpdateFormData
    });

    render(<InternationalTravelPage />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ passportImageUrl: undefined });
  });
});