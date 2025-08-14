'use client';

import React, { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUploadService } from '@/services/file-upload-service';
import { useFormStore } from '@/stores/form-store';

interface FileUploadZoneProps {
  type: 'passport' | 'flight';
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (files: any[]) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadProgress?: number;
  error?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  type,
  multiple = false,
  maxFiles = type === 'flight' ? 3 : 1,
  onUploadComplete,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadService = useRef(new FileUploadService());
  
  const { updateFormData, formData } = useFormStore();

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  // Handle file selection
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleFiles(files);
  };

  // Process selected files
  const handleFiles = async (files: File[]) => {
    if (!files.length) return;

    // Check file count limit
    const remainingSlots = maxFiles - uploadedFiles.length;
    if (remainingSlots <= 0) {
      alert(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setUploading(true);

    for (const file of filesToUpload) {
      const tempId = Math.random().toString(36).substring(7);
      
      // Add file to list with loading state
      const tempFile: UploadedFile = {
        id: tempId,
        fileName: file.name,
        fileUrl: '',
        fileSize: file.size,
        fileType: file.type,
        uploadProgress: 0
      };

      setUploadedFiles(prev => [...prev, tempFile]);

      // Upload file
      const result = await uploadService.current.uploadWithProgress(
        file,
        (progress) => {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === tempId
                ? { ...f, uploadProgress: progress.percentage }
                : f
            )
          );
        },
        {
          fileType: type,
          validation: {
            maxSize: 10 * 1024 * 1024
          }
        }
      );

      if (!result) {
        // Handle undefined result
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, error: 'Erro ao conectar com o servidor', uploadProgress: undefined }
              : f
          )
        );
      } else if (result.success) {
        // Update file with success data
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? {
                  ...f,
                  fileUrl: result.fileUrl || '',
                  uploadProgress: 100
                }
              : f
          )
        );

        // Update form store
        if (type === 'passport') {
          updateFormData({ passportImageUrl: result.fileUrl });
        } else if (type === 'flight') {
          const currentFiles = formData.flightSuggestionFiles || [];
          updateFormData({
            flightSuggestionFiles: [
              ...currentFiles,
              {
                fileName: result.fileName || file.name,
                fileUrl: result.fileUrl || '',
                fileSize: result.fileSize || file.size,
                fileType: result.fileType || file.type
              }
            ]
          });
        }
      } else {
        // Update file with error
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, error: result.error || 'Erro desconhecido', uploadProgress: undefined }
              : f
          )
        );
      }
    }

    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
  };

  // Remove uploaded file
  const removeFile = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    // Remove from UI
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

    // Update form store
    if (type === 'passport') {
      updateFormData({ passportImageUrl: undefined });
    } else if (type === 'flight') {
      const currentFiles = formData.flightSuggestionFiles || [];
      updateFormData({
        flightSuggestionFiles: currentFiles.filter(f => f.fileUrl !== file.fileUrl)
      });
    }

    // Delete from server if URL exists
    if (file.fileUrl) {
      await uploadService.current.deleteFile(file.fileUrl);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={type === 'passport' ? 'image/jpeg,image/jpg,image/png' : '.pdf,.doc,.docx,image/jpeg,image/jpg,image/png'}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <p className="text-lg font-medium mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          {type === 'passport' 
            ? 'Imagem do passaporte (JPG, PNG - máx. 10MB)'
            : `Sugestões de voo (PDF, DOC, DOCX, JPG, PNG - máx. ${maxFiles} arquivos, 10MB cada)`
          }
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedFiles.length >= maxFiles}
        >
          Selecionar Arquivos
        </Button>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Arquivos enviados:</h3>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                {getFileIcon(file.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)}
                  </p>
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                    <Progress value={file.uploadProgress} className="h-1 mt-1" />
                  )}
                  {file.error && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {file.error}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                disabled={file.uploadProgress !== undefined && file.uploadProgress < 100}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* File count indicator */}
      {maxFiles > 1 && (
        <p className="text-sm text-gray-500 text-center">
          {uploadedFiles.length} de {maxFiles} arquivo(s) enviado(s)
        </p>
      )}
    </div>
  );
};