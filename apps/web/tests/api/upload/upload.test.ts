import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/upload/route';

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn()
      }))
    }
  }))
}));

// Mock fs promises
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true)
}));

describe('File Upload API', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    const { createClient } = require('@/lib/supabase/client');
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-123' } },
          error: null
        })
      },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({
            data: { path: 'test-path' },
            error: null
          }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/test-file.jpg' }
          }),
          remove: vi.fn().mockResolvedValue({
            error: null
          })
        })
      }
    };
    createClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should upload a valid image file', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      // Mock formData parsing
      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fileName).toBe('test.jpg');
      expect(json.data.fileSize).toBe(12);
      expect(json.data.fileType).toBe('image/jpeg');
    });

    it('should upload a valid PDF document', async () => {
      const file = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'flight');

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fileName).toBe('document.pdf');
      expect(json.data.fileType).toBe('application/pdf');
    });

    it('should reject files without authentication', async () => {
      // Mock unauthorized user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Não autorizado');
    });

    it('should reject files with invalid type', async () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Tipo de arquivo não permitido. Use JPG, PNG, PDF, DOC ou DOCX');
    });

    it('should reject files larger than 10MB', async () => {
      // Create a mock file larger than 10MB
      const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Arquivo muito grande (máximo 10MB)');
    });

    it('should handle missing file', async () => {
      const formData = new FormData();

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Nenhum arquivo fornecido');
    });

    it('should handle Supabase upload error', async () => {
      // Mock upload failure
      mockSupabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      request.formData = vi.fn().mockResolvedValue(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Erro ao fazer upload do arquivo');
    });
  });

  describe('DELETE /api/upload', () => {
    it('should delete a file successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload?path=test-user-123/passport/test.jpg', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockSupabase.storage.from().remove).toHaveBeenCalledWith(['test-user-123/passport/test.jpg']);
    });

    it('should reject deletion without authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const request = new NextRequest('http://localhost:3000/api/upload?path=test-path', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Não autorizado');
    });

    it('should reject deletion of files not belonging to user', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload?path=other-user/passport/test.jpg', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Acesso negado');
    });

    it('should handle missing file path', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Caminho do arquivo é obrigatório');
    });

    it('should handle Supabase deletion error', async () => {
      mockSupabase.storage.from().remove.mockResolvedValue({
        error: { message: 'Delete failed' }
      });

      const request = new NextRequest('http://localhost:3000/api/upload?path=test-user-123/passport/test.jpg', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Erro ao deletar arquivo');
    });
  });
});