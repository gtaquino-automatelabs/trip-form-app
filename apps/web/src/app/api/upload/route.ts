import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { validateFile, isSafeFileName, generateSecureFileName } from '@/lib/file-validation';

// File type validation configuration
const ALLOWED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    extensions: ['jpg', 'jpeg', 'png']
  },
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    extensions: ['pdf', 'doc', 'docx']
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Portuguese error messages
const ERROR_MESSAGES = {
  NO_FILE: 'Nenhum arquivo fornecido',
  INVALID_TYPE: 'Tipo de arquivo não permitido. Use JPG, PNG, PDF, DOC ou DOCX',
  FILE_TOO_LARGE: 'Arquivo muito grande (máximo 10MB)',
  UNAUTHORIZED: 'Não autorizado',
  UPLOAD_FAILED: 'Erro ao fazer upload do arquivo',
  SERVER_ERROR: 'Erro interno do servidor'
};

// Validate file type
function isValidFileType(file: File): boolean {
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.images.mimeTypes,
    ...ALLOWED_FILE_TYPES.documents.mimeTypes
  ];
  return allAllowedTypes.includes(file.type);
}

// Sanitize filename to prevent path traversal
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Generate unique filename with timestamp
function generateUniqueFileName(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFileName(originalName);
  const userPrefix = userId || 'anonymous';
  return `${timestamp}_${userPrefix}_${sanitized}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'passport' or 'flight'
    
    if (!file) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_FILE },
        { status: 400 }
      );
    }

    // Enhanced file validation with security checks
    const validation = await validateFile(file, { 
      maxSize: MAX_FILE_SIZE,
      checkSignature: true 
    });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || ERROR_MESSAGES.INVALID_TYPE },
        { status: 400 }
      );
    }
    
    // Additional filename security check
    if (!isSafeFileName(file.name)) {
      return NextResponse.json(
        { error: 'Nome de arquivo inválido ou inseguro' },
        { status: 400 }
      );
    }

    // Get user session - use server client for API routes
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Determine storage strategy based on environment
    const useSupabaseStorage = process.env.USE_SUPABASE_STORAGE === 'true';
    
    let fileUrl: string;
    let filePath: string;
    
    if (useSupabaseStorage) {
      // Upload to Supabase Storage with secure filename
      const folder = fileType === 'passport' ? 'passport' : 'flights';
      const uniqueFileName = generateSecureFileName(file.name, user.id, folder);
      filePath = `${user.id}/${folder}/${uniqueFileName}`;

      const fileBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('travel-documents')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json(
          { error: ERROR_MESSAGES.UPLOAD_FAILED },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('travel-documents')
        .getPublicUrl(filePath);
        
      fileUrl = urlData.publicUrl;
    } else {
      // Local file storage (development) with secure filename
      const uniqueFileName = generateSecureFileName(file.name, user.id, 'local');
      const uploadDir = path.join(process.cwd(), 'apps', 'web', 'public', 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      filePath = path.join(uploadDir, uniqueFileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      
      // Return relative URL for local files
      fileUrl = `/uploads/${uniqueFileName}`;
    }

    // Return upload result with progress tracking support
    return NextResponse.json({
      success: true,
      data: {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        filePath: useSupabaseStorage ? filePath : undefined
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: ERROR_MESSAGES.SERVER_ERROR,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for file removal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Caminho do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Get user session - use server client for API routes
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Verify the file belongs to the user - more secure check
    if (!filePath.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const useSupabaseStorage = process.env.USE_SUPABASE_STORAGE === 'true';
    
    if (useSupabaseStorage) {
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('travel-documents')
        .remove([filePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json(
          { error: 'Erro ao deletar arquivo' },
          { status: 500 }
        );
      }
    }
    // Note: Local file deletion not implemented for security in development

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}