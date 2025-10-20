import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Create Supabase client
    const supabase = await createClient();

    // Build query with optional search filter
    let query = supabase
      .from('bancos_brasileiros')
      .select('codigo_compensacao, nome_instituicao')
      .order('nome_instituicao', { ascending: true });

    // Add search filter if provided
    if (search.trim()) {
      query = query.ilike('nome_instituicao', `%${search.trim()}%`);
    }

    // Add limit
    query = query.limit(limit);

    // Execute query
    const { data: banks, error } = await query;

    if (error) {
      console.error('Error fetching banks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch banks', details: error.message },
        { status: 500 }
      );
    }

    // Transform data for frontend use
    const formattedBanks = banks?.map(bank => ({
      value: bank.nome_instituicao,
      label: bank.nome_instituicao,
      code: bank.codigo_compensacao
    })) || [];

    return NextResponse.json({
      banks: formattedBanks,
      total: formattedBanks.length
    });

  } catch (error) {
    console.error('Unexpected error in banks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
