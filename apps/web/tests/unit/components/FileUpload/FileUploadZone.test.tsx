import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadZone } from '@/components/form/FileUploadZone';

// Create mock functions that we can control
const mockUploadWithProgress = vi.fn();
const mockDeleteFile = vi.fn();
const mockUpdateFormData = vi.fn();

// Mock the FileUploadService
vi.mock('@/services/file-upload-service', () => ({
  FileUploadService: vi.fn().mockImplementation(() => ({
    uploadWithProgress: mockUploadWithProgress,
    deleteFile: mockDeleteFile
  }))
}));

// Mock the form store
vi.mock('@/stores/form-store', () => ({
  useFormStore: () => ({
    formData: {
      flightSuggestionFiles: []
    },
    updateFormData: mockUpdateFormData
  })
}));

describe('FileUploadZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default successful response
    mockUploadWithProgress.mockResolvedValue({
      success: true,
      fileUrl: 'https://example.com/test.jpg',
      fileName: 'test.jpg',
      fileSize: 1000,
      fileType: 'image/jpeg'
    });
    mockDeleteFile.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload zone with correct text for passport type', () => {
    render(<FileUploadZone type="passport" />);
    
    expect(screen.getByText('Arraste arquivos aqui ou clique para selecionar')).toBeInTheDocument();
    expect(screen.getByText(/Imagem do passaporte/)).toBeInTheDocument();
  });

  it('renders upload zone with correct text for flight type', () => {
    render(<FileUploadZone type="flight" multiple={true} maxFiles={3} />);
    
    expect(screen.getByText('Arraste arquivos aqui ou clique para selecionar')).toBeInTheDocument();
    expect(screen.getByText(/Sugestões de voo/)).toBeInTheDocument();
  });

  it('handles file selection via button click', async () => {
    render(<FileUploadZone type="passport" />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockUploadWithProgress).toHaveBeenCalledWith(
        file,
        expect.any(Function),
        expect.objectContaining({
          fileType: 'passport',
          validation: {
            maxSize: 10 * 1024 * 1024
          }
        })
      );
    });
  });

  it('shows upload progress', async () => {
    render(<FileUploadZone type="passport" />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    let progressCallback: ((progress: any) => void) | null = null;
    mockUploadWithProgress.mockImplementation((file: File, onProgress: (progress: any) => void) => {
      progressCallback = onProgress;
      // Simulate progress update
      setTimeout(() => {
        if (progressCallback) {
          progressCallback({ loaded: 512, total: 1024, percentage: 50 });
        }
      }, 10);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            fileUrl: 'http://example.com/test.jpg',
            fileName: 'test.jpg',
            fileSize: 1024,
            fileType: 'image/jpeg'
          });
        }, 100);
      });
    });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays uploaded files', async () => {
    render(<FileUploadZone type="passport" />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // Create a file with more content to get a larger size
    const fileContent = new Array(1024).fill('a').join(''); // 1024 bytes = 1KB
    const file = new File([fileContent], 'test.jpg', { type: 'image/jpeg' });
    
    // Update mock to return 1KB file size
    mockUploadWithProgress.mockResolvedValueOnce({
      success: true,
      fileUrl: 'https://example.com/test.jpg',
      fileName: 'test.jpg',
      fileSize: 1024,  // 1KB exactly
      fileType: 'image/jpeg'
    });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // File size should show as "1 KB"
    await waitFor(() => {
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });
  });

  it('handles file removal', async () => {
    render(<FileUploadZone type="passport" />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Find the remove button - it's likely an X icon button
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent?.includes('X')
    );

    if (removeButton) {
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      });

      expect(mockDeleteFile).toHaveBeenCalledWith('https://example.com/test.jpg');
    }
  });

  it('displays error for invalid files', async () => {
    mockUploadWithProgress.mockResolvedValue({
      success: false,
      error: 'Tipo de arquivo não permitido'
    });

    render(<FileUploadZone type="passport" />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Tipo de arquivo não permitido')).toBeInTheDocument();
    });
  });

  it('enforces file count limit', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<FileUploadZone type="flight" multiple={true} maxFiles={1} />);
    
    // Upload first file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file1],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    // Try to upload second file
    const file2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file2],
      writable: false,
      configurable: true
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Máximo de 1 arquivo(s) permitido(s)');
    });

    alertSpy.mockRestore();
  });

  it('shows file count indicator for multiple files', () => {
    render(<FileUploadZone type="flight" multiple={true} maxFiles={3} />);
    
    expect(screen.getByText('0 de 3 arquivo(s) enviado(s)')).toBeInTheDocument();
  });

  it('handles drag and drop', async () => {
    render(<FileUploadZone type="passport" />);
    
    const dropZone = screen.getByText('Arraste arquivos aqui ou clique para selecionar').closest('div[class*="border-dashed"]');
    
    if (!dropZone) {
      throw new Error('Drop zone not found');
    }

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate drag enter
    const dragEnterEvent = new DragEvent('dragenter', { bubbles: true });
    fireEvent(dropZone, dragEnterEvent);
    
    // Check if drag state is active (blue border)
    await waitFor(() => {
      expect(dropZone.className).toContain('border-blue-500');
    });

    // Simulate drag leave
    const dragLeaveEvent = new DragEvent('dragleave', { bubbles: true });
    fireEvent(dropZone, dragLeaveEvent);
    
    // Check if drag state is inactive
    await waitFor(() => {
      expect(dropZone.className).not.toContain('border-blue-500');
    });

    // Simulate drop
    const dropEvent = new DragEvent('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file],
        preventDefault: () => {}
      },
      writable: false
    });
    
    fireEvent(dropZone, dropEvent);

    await waitFor(() => {
      expect(mockUploadWithProgress).toHaveBeenCalledWith(
        file,
        expect.any(Function),
        expect.objectContaining({
          fileType: 'passport'
        })
      );
    });
  });
});