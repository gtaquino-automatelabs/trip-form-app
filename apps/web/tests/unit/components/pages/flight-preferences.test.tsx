import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FlightPreferencesPage } from '@/components/form/pages/flight-preferences';

// Mock the form store
const mockUpdateFormData = vi.fn();
const mockFormData = {
  flightPreferences: '',
  flightSuggestionUrls: [],
  flightSuggestionFiles: []
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

// Mock fetch for file upload
global.fetch = vi.fn();

describe('FlightPreferencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form elements', () => {
    render(<FlightPreferencesPage />);
    
    expect(screen.getByText(/preferências de voo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observações sobre preferências/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/documentos de sugestão/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/links de sugestão/i)).toBeInTheDocument();
  });

  it('updates flight preferences when textarea changes', async () => {
    const user = userEvent.setup();
    render(<FlightPreferencesPage />);
    
    const textarea = screen.getByLabelText(/observações sobre preferências/i);
    await user.type(textarea, 'Prefiro voos da TAM ou Gol');
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      flightPreferences: 'Prefiro voos da TAM ou Gol' 
    });
  });

  it('handles file upload successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        files: [{
          fileName: 'flight-suggestions.pdf',
          fileUrl: 'https://example.com/flight-suggestions.pdf',
          fileSize: 2048,
          fileType: 'application/pdf'
        }]
      })
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
    
    render(<FlightPreferencesPage />);
    
    const fileInput = screen.getByLabelText(/documentos de sugestão/i);
    const file = new File(['test'], 'flight-suggestions.pdf', { type: 'application/pdf' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload/flight-suggestion', expect.any(Object));
    });
    
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({ 
        flightSuggestionFiles: expect.arrayContaining([
          expect.objectContaining({
            fileName: 'flight-suggestions.pdf',
            fileUrl: 'https://example.com/flight-suggestions.pdf'
          })
        ])
      });
    });
  });

  it('handles file upload error', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: 'Máximo de 3 arquivos permitido'
      })
    };
    
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
    
    render(<FlightPreferencesPage />);
    
    const fileInput = screen.getByLabelText(/documentos de sugestão/i);
    const file = new File(['test'], 'flight-suggestions.pdf', { type: 'application/pdf' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/máximo de 3 arquivos permitido/i)).toBeInTheDocument();
    });
  });

  it('shows uploaded files list', () => {
    const formDataWithFiles = {
      ...mockFormData,
      flightSuggestionFiles: [{
        fileName: 'flight-suggestions.pdf',
        fileUrl: 'https://example.com/flight-suggestions.pdf',
        fileSize: 2048,
        fileType: 'application/pdf'
      }]
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithFiles,
      updateFormData: mockUpdateFormData
    });

    render(<FlightPreferencesPage />);
    
    expect(screen.getByText(/arquivos enviados/i)).toBeInTheDocument();
    expect(screen.getByText('flight-suggestions.pdf')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('handles file removal', async () => {
    const user = userEvent.setup();
    const formDataWithFiles = {
      ...mockFormData,
      flightSuggestionFiles: [{
        fileName: 'flight-suggestions.pdf',
        fileUrl: 'https://example.com/user123/flights/flight-suggestions.pdf',
        fileSize: 2048,
        fileType: 'application/pdf'
      }]
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithFiles,
      updateFormData: mockUpdateFormData
    });

    // Mock DELETE request
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as Response);

    render(<FlightPreferencesPage />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/upload/flight-suggestion?path='),
      expect.objectContaining({ method: 'DELETE' })
    );
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      flightSuggestionFiles: [] 
    });
  });

  it('adds URL suggestions', async () => {
    const user = userEvent.setup();
    render(<FlightPreferencesPage />);
    
    const urlInput = screen.getByLabelText(/links de sugestão/i);
    const addButton = screen.getByRole('button', { name: /adicionar/i });
    
    await user.type(urlInput, 'https://www.latam.com/flight-example');
    await user.click(addButton);
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      flightSuggestionUrls: ['https://www.latam.com/flight-example'] 
    });
  });

  it('validates URL format', async () => {
    const user = userEvent.setup();
    render(<FlightPreferencesPage />);
    
    const urlInput = screen.getByLabelText(/links de sugestão/i);
    const addButton = screen.getByRole('button', { name: /adicionar/i });
    
    await user.type(urlInput, 'invalid-url');
    
    // Button should be disabled for invalid URL
    expect(addButton).toBeDisabled();
  });

  it('removes URL suggestions', async () => {
    const user = userEvent.setup();
    const formDataWithUrls = {
      ...mockFormData,
      flightSuggestionUrls: ['https://www.latam.com/flight-example']
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithUrls,
      updateFormData: mockUpdateFormData
    });

    render(<FlightPreferencesPage />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      flightSuggestionUrls: [] 
    });
  });

  it('handles multiple file uploads up to limit', async () => {
    const user = userEvent.setup();
    const formDataWithTwoFiles = {
      ...mockFormData,
      flightSuggestionFiles: [
        { fileName: 'file1.pdf', fileUrl: 'url1', fileSize: 1024, fileType: 'application/pdf' },
        { fileName: 'file2.pdf', fileUrl: 'url2', fileSize: 1024, fileType: 'application/pdf' }
      ]
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithTwoFiles,
      updateFormData: mockUpdateFormData
    });

    render(<FlightPreferencesPage />);
    
    const fileInput = screen.getByLabelText(/documentos de sugestão/i);
    const files = [
      new File(['test1'], 'file3.pdf', { type: 'application/pdf' }),
      new File(['test2'], 'file4.pdf', { type: 'application/pdf' })
    ];
    
    await user.upload(fileInput, files);
    
    // Should show error for exceeding file limit
    expect(screen.getByText(/máximo de 3 arquivos permitido/i)).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const formDataWithFiles = {
      ...mockFormData,
      flightSuggestionFiles: [
        { fileName: 'small.pdf', fileUrl: 'url1', fileSize: 1024, fileType: 'application/pdf' },
        { fileName: 'large.pdf', fileUrl: 'url2', fileSize: 1048576, fileType: 'application/pdf' }
      ]
    };

    vi.mocked(useFormStore).mockReturnValue({
      formData: formDataWithFiles,
      updateFormData: mockUpdateFormData
    });

    render(<FlightPreferencesPage />);
    
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });
});