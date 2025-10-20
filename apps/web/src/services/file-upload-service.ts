import { SupabaseClient } from '@supabase/supabase-js';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
  filePath?: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

// Default validation options
const DEFAULT_VALIDATION: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
};

export class FileUploadService {
  private supabase: SupabaseClient | null = null;
  private bucketName: string = 'travel-documents';

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || null;
  }

  /**
   * Validate a file against specified criteria
   */
  validateFile(file: File, options: FileValidationOptions = {}): { valid: boolean; error?: string } {
    const opts = { ...DEFAULT_VALIDATION, ...options };

    // Check file size
    if (opts.maxSize && file.size > opts.maxSize) {
      const maxSizeMB = Math.round(opts.maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `Arquivo muito grande (máximo ${maxSizeMB}MB)`
      };
    }

    // Check file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido'
      };
    }

    // Check file extension
    if (opts.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !opts.allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: 'Extensão de arquivo não permitida'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadWithProgress(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    options?: {
      fileType?: 'passport' | 'flight' | 'other';
      validation?: FileValidationOptions;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options?.validation);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      if (options?.fileType) {
        formData.append('type', options.fileType);
      }

      // Create XMLHttpRequest for progress tracking
      return new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve({
                  success: true,
                  fileUrl: response.data.fileUrl,
                  fileName: response.data.fileName,
                  fileSize: response.data.fileSize,
                  fileType: response.data.fileType,
                  filePath: response.data.filePath
                });
              } else {
                resolve({
                  success: false,
                  error: response.error || 'Erro no upload'
                });
              }
            } catch (e) {
              resolve({
                success: false,
                error: 'Erro ao processar resposta'
              });
            }
          } else {
            resolve({
              success: false,
              error: `Erro no servidor (${xhr.status})`
            });
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Erro de conexão'
          });
        });

        // Send request
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload do arquivo'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    options?: {
      fileType?: 'passport' | 'flight' | 'other';
      validation?: FileValidationOptions;
    }
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadWithProgress(
        files[i],
        (progress) => onProgress?.(i, progress),
        options
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/upload?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Erro ao deletar arquivo'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: 'Erro ao deletar arquivo'
      };
    }
  }

  /**
   * Clean up orphaned files (files uploaded but not submitted)
   */
  async cleanupOrphanedFiles(
    userId: string,
    olderThanMinutes: number = 60
  ): Promise<{ cleaned: number; errors: string[] }> {
    // This would be implemented on the server side
    // For now, we'll just log the intention
    console.log(`Cleanup requested for user ${userId}, files older than ${olderThanMinutes} minutes`);
    
    // In a real implementation, this would:
    // 1. Query for files associated with the user
    // 2. Check if they're linked to a submitted form
    // 3. Delete files that are orphaned and older than the threshold
    
    return {
      cleaned: 0,
      errors: []
    };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an image
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocument(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return documentTypes.includes(file.type);
  }
}