import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate maximum number of files (3)
    if (files.length > 3) {
      return NextResponse.json({ 
        error: 'Máximo de 3 arquivos permitido' 
      }, { status: 400 });
    }

    // Validate file types
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    // Validate total size (10MB limit)
    const maxTotalSize = 10 * 1024 * 1024; // 10MB
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > maxTotalSize) {
      return NextResponse.json({ 
        error: 'Tamanho total dos arquivos excede 10MB' 
      }, { status: 400 });
    }

    // Validate each file
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `Tipo de arquivo não permitido: ${file.name}. Use PDF, DOC, DOCX, PNG ou JPG.` 
        }, { status: 400 });
      }
    }

    // Get user session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const uploadedFiles = [];

    // Upload each file
    for (const file of files) {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomSuffix}-${file.name}`;
      const filePath = `${user.id}/flights/${fileName}`;

      // Convert File to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('travel-documents')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json({ 
          error: `Erro ao fazer upload do arquivo: ${file.name}` 
        }, { status: 500 });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('travel-documents')
        .getPublicUrl(filePath);

      uploadedFiles.push({
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        fileType: file.type
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Get user session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verify the file belongs to the user
    if (!filePath.startsWith(`${user.id}/flights/`)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('travel-documents')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ 
        error: 'Erro ao deletar arquivo' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}