/**
 * Enhanced file validation utilities with security focus
 */

// MIME type to extension mapping for validation
const MIME_TO_EXTENSION_MAP: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/jpg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
};

// Magic numbers for file type verification
const FILE_SIGNATURES: Record<string, number[]> = {
  'jpg': [0xFF, 0xD8, 0xFF],
  'png': [0x89, 0x50, 0x4E, 0x47],
  'pdf': [0x25, 0x50, 0x44, 0x46],
  'doc': [0xD0, 0xCF, 0x11, 0xE0],
  'docx': [0x50, 0x4B, 0x03, 0x04]
};

/**
 * Validate file MIME type matches its extension
 */
export function validateMimeTypeAndExtension(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return false;
  }
  
  const allowedExtensions = MIME_TO_EXTENSION_MAP[file.type];
  
  if (!allowedExtensions) {
    return false;
  }
  
  return allowedExtensions.includes(extension);
}

/**
 * Check file magic numbers (file signature)
 * This provides an additional layer of security beyond MIME type checking
 */
export async function verifyFileSignature(file: File): Promise<boolean> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !FILE_SIGNATURES[extension]) {
    return false;
  }
  
  const signature = FILE_SIGNATURES[extension];
  const buffer = await file.slice(0, signature.length).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // For DOCX, we only check the ZIP signature (PK..)
  if (extension === 'docx') {
    return bytes[0] === signature[0] && bytes[1] === signature[1];
  }
  
  // For other formats, check full signature
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Comprehensive file validation
 */
export async function validateFile(
  file: File,
  options?: {
    maxSize?: number;
    checkSignature?: boolean;
  }
): Promise<{ valid: boolean; error?: string }> {
  const maxSize = options?.maxSize || 10 * 1024 * 1024; // Default 10MB
  const checkSignature = options?.checkSignature !== false; // Default true
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Arquivo muito grande (máximo ${maxSizeMB}MB)`
    };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Arquivo vazio não é permitido'
    };
  }
  
  // Validate MIME type and extension match
  if (!validateMimeTypeAndExtension(file)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não corresponde à extensão'
    };
  }
  
  // Verify file signature if requested
  if (checkSignature) {
    const isValidSignature = await verifyFileSignature(file);
    if (!isValidSignature) {
      return {
        valid: false,
        error: 'Arquivo corrompido ou tipo inválido'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check if filename contains suspicious patterns
 */
export function isSafeFileName(fileName: string): boolean {
  // Check for path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  
  // Check for null bytes
  if (fileName.includes('\0')) {
    return false;
  }
  
  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(fileName)) {
    return false;
  }
  
  // Check for overly long filenames
  if (fileName.length > 255) {
    return false;
  }
  
  return true;
}

/**
 * Generate a secure filename
 */
export function generateSecureFileName(
  originalName: string,
  userId: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase() || 'unknown';
  const randomString = Math.random().toString(36).substring(2, 8);
  const safePrefix = prefix ? prefix.replace(/[^a-zA-Z0-9]/g, '') : '';
  
  return `${timestamp}_${userId}_${safePrefix}${randomString}.${extension}`;
}