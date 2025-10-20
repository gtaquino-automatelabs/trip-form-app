'use client';

import React, { useState, useEffect } from 'react';
import { FileText, FileImage, X, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FilePreviewProps {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  onRemove?: () => void;
  showActions?: boolean;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileName,
  fileUrl,
  fileSize,
  fileType,
  onRemove,
  showActions = true,
  className
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    // Generate preview for images
    if (fileType.startsWith('image/') && fileUrl) {
      setImagePreview(fileUrl);
    }
  }, [fileUrl, fileType]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  // Get file extension
  const getFileExtension = () => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() : 'FILE';
  };

  return (
    <>
      <div className={cn(
        'relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="flex items-start space-x-3">
          {/* Thumbnail or Icon */}
          <div className="flex-shrink-0">
            {imagePreview ? (
              <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
                <Image
                  src={imagePreview}
                  alt={fileName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {getFileIcon()}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {fileName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getFileExtension()} • {formatFileSize(fileSize)}
            </p>
            
            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2 mt-2">
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullPreview(true)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>
                )}
                
                {fileUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-xs"
                  >
                    <a href={fileUrl} download={fileName}>
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Remove Button */}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {showFullPreview && imagePreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFullPreview(false)}
              className="absolute top-2 right-2 z-10 bg-white/10 hover:bg-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
            <Image
              src={imagePreview}
              alt={fileName}
              width={1200}
              height={800}
              className="max-w-full max-h-[85vh] object-contain rounded"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
};