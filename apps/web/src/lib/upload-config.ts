/**
 * Upload configuration and validation utilities
 */

interface UploadConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  allowedImageExtensions: string[];
  allowedDocumentExtensions: string[];
  useSupabaseStorage: boolean;
  cleanupApiKey?: string;
}

/**
 * Get upload configuration from environment variables
 */
export function getUploadConfig(): UploadConfig {
  return {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedImageExtensions: ['jpg', 'jpeg', 'png'],
    allowedDocumentExtensions: ['pdf', 'doc', 'docx'],
    useSupabaseStorage: process.env.USE_SUPABASE_STORAGE === 'true',
    cleanupApiKey: process.env.CLEANUP_API_KEY
  };
}

/**
 * Validate upload configuration
 */
export function validateUploadConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getUploadConfig();
  
  // Check if storage mode is configured
  if (process.env.USE_SUPABASE_STORAGE === undefined) {
    errors.push('USE_SUPABASE_STORAGE environment variable not set');
  }
  
  // Check if cleanup API key is set in production
  if (process.env.NODE_ENV === 'production' && !config.cleanupApiKey) {
    errors.push('CLEANUP_API_KEY not set for production environment');
  }
  
  // Validate file size limit
  if (config.maxFileSize <= 0) {
    errors.push('Invalid max file size configuration');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string, config?: UploadConfig): boolean {
  const cfg = config || getUploadConfig();
  const allTypes = [...cfg.allowedImageTypes, ...cfg.allowedDocumentTypes];
  return allTypes.includes(mimeType);
}

/**
 * Check if a file extension is allowed
 */
export function isAllowedExtension(extension: string, config?: UploadConfig): boolean {
  const cfg = config || getUploadConfig();
  const allExtensions = [...cfg.allowedImageExtensions, ...cfg.allowedDocumentExtensions];
  return allExtensions.includes(extension.toLowerCase());
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any path separators and special characters
  return fileName
    .replace(/[\/\\]/g, '_')  // Replace path separators
    .replace(/\.{2,}/g, '_')  // Replace multiple dots
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Keep only safe characters
    .replace(/^\./, '_');  // Don't allow starting with dot
}