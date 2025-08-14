import { NextRequest, NextResponse } from 'next/server';
import { FileCleanupService } from '@/lib/file-cleanup';
import { createClient } from '@/lib/supabase/server';

// This endpoint should be protected and only callable by authorized services
// In production, you might want to add API key authentication or use a cron service

export async function POST(request: NextRequest) {
  try {
    // Check for authorization (you should implement proper auth here)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CLEANUP_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get cleanup parameters from request
    const body = await request.json().catch(() => ({}));
    const olderThanMinutes = body.olderThanMinutes || 60;

    // Create cleanup service
    const supabase = await createClient();
    const cleanupService = new FileCleanupService(supabase);

    // Run cleanup
    const result = await cleanupService.runCleanup(olderThanMinutes);

    return NextResponse.json({
      success: result.success,
      filesDeleted: result.filesDeleted,
      errors: result.errors,
      message: `Limpeza concluída. ${result.filesDeleted} arquivo(s) removido(s).`
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao executar limpeza',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check cleanup status (for monitoring)
export async function GET(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CLEANUP_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: 'ready',
      message: 'Serviço de limpeza disponível',
      lastRun: null // You could store this in a database or cache
    });

  } catch (error) {
    console.error('Cleanup status error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}