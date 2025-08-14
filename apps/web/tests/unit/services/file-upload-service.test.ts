import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileUploadService } from '@/services/file-upload-service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(() => {
    service = new FileUploadService();
    // Reset any global mocks
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate a valid image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid PDF file', () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid Word document', () => {
      const file = new File(['test'], 'document.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files larger than max size', () => {
      const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Arquivo muito grande (máximo 10MB)');
    });

    it('should reject files with invalid type', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tipo de arquivo não permitido');
    });

    it('should reject files with invalid extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = service.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tipo de arquivo não permitido');
    });

    it('should validate with custom options', () => {
      const file = new File(['small'], 'small.jpg', { type: 'image/jpeg' });
      const options = {
        maxSize: 100, // 100 bytes
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg']
      };
      
      const result = service.validateFile(file, options);
      
      expect(result.valid).toBe(true);
    });

    it('should reject based on custom max size', () => {
      const file = new File(['too large'], 'test.jpg', { type: 'image/jpeg' });
      const options = {
        maxSize: 5 // 5 bytes
      };
      
      const result = service.validateFile(file, options);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Arquivo muito grande (máximo 0MB)');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
      expect(service.formatFileSize(100)).toBe('100 Bytes');
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(service.formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
      expect(service.formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(service.getFileExtension('test.jpg')).toBe('jpg');
      expect(service.getFileExtension('document.pdf')).toBe('pdf');
      expect(service.getFileExtension('file.name.with.dots.docx')).toBe('docx');
      expect(service.getFileExtension('noextension')).toBe('');
    });
  });

  describe('isImage', () => {
    it('should identify image files', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      
      expect(service.isImage(imageFile)).toBe(true);
      expect(service.isImage(pdfFile)).toBe(false);
    });
  });

  describe('isDocument', () => {
    it('should identify document files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const docFile = new File([''], 'test.doc', { type: 'application/msword' });
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      expect(service.isDocument(pdfFile)).toBe(true);
      expect(service.isDocument(docFile)).toBe(true);
      expect(service.isDocument(imageFile)).toBe(false);
    });
  });

  describe('uploadWithProgress', () => {
    it('should handle upload with progress tracking', async () => {
      // Mock XMLHttpRequest
      const mockXHR = {
        upload: {
          addEventListener: vi.fn()
        },
        addEventListener: vi.fn(),
        open: vi.fn(),
        send: vi.fn(),
        status: 200,
        responseText: JSON.stringify({
          success: true,
          data: {
            fileUrl: 'https://example.com/file.jpg',
            fileName: 'test.jpg',
            fileSize: 1024,
            fileType: 'image/jpeg'
          }
        })
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR) as any;

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      // Simulate the request
      const uploadPromise = service.uploadWithProgress(file, progressCallback);

      // Simulate load event
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      )?.[1];
      
      if (loadHandler) {
        loadHandler();
      }

      const result = await uploadPromise;

      expect(result.success).toBe(true);
      expect(result.fileUrl).toBe('https://example.com/file.jpg');
      expect(result.fileName).toBe('test.jpg');
      expect(mockXHR.open).toHaveBeenCalledWith('POST', '/api/upload');
    });

    it('should handle validation failure', async () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      
      const result = await service.uploadWithProgress(file);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Tipo de arquivo não permitido');
    });
  });

  describe('uploadMultiple', () => {
    it('should upload multiple files', async () => {
      // Mock uploadWithProgress
      service.uploadWithProgress = vi.fn().mockResolvedValue({
        success: true,
        fileUrl: 'https://example.com/file.jpg',
        fileName: 'test.jpg'
      });

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      const progressCallback = vi.fn();
      const results = await service.uploadMultiple(files, progressCallback);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(service.uploadWithProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await service.deleteFile('test-path/file.jpg');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/upload?path=test-path%2Ffile.jpg',
        { method: 'DELETE' }
      );
    });

    it('should handle deletion error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Delete failed' })
      });

      const result = await service.deleteFile('test-path/file.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });
});