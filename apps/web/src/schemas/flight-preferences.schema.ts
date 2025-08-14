import { z } from 'zod';

export const flightPreferencesSchema = z.object({
  flightPreferences: z
    .string()
    .optional()
    .refine((text) => {
      if (!text) return true; // Optional field
      return text.trim().length <= 1000;
    }, 'Observações não podem exceder 1000 caracteres'),
    
  flightSuggestionUrls: z
    .array(z.string().url('URL inválida'))
    .optional()
    .default([]),
    
  flightSuggestionFiles: z
    .array(z.object({
      fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
      fileUrl: z.string().url('URL do arquivo inválida'),
      fileSize: z.number().min(1, 'Tamanho do arquivo inválido'),
      fileType: z.string().min(1, 'Tipo do arquivo é obrigatório'),
    }))
    .optional()
    .default([])
    .refine((files) => {
      return files.length <= 3;
    }, 'Máximo de 3 arquivos permitido')
    .refine((files) => {
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      const maxTotalSize = 10 * 1024 * 1024; // 10MB
      return totalSize <= maxTotalSize;
    }, 'Tamanho total dos arquivos não pode exceder 10MB'),
});

export type FlightPreferences = z.infer<typeof flightPreferencesSchema>;

// Helper function to validate file types
export const validateFileType = (filename: string): boolean => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(fileExtension);
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate total file size
export const validateTotalFileSize = (files: Array<{ fileSize: number }>): boolean => {
  const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
  const maxTotalSize = 10 * 1024 * 1024; // 10MB
  return totalSize <= maxTotalSize;
};