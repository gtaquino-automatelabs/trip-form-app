import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/route';

export async function GET() {
  try {
    const supabase = await createServiceClient();
    
    // Test actual database connection by querying profiles table
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      throw dbError;
    }
    
    // Test auth system
    const { error: authError } = await supabase.auth.getSession();
    if (authError && authError.message !== 'Auth session missing!') {
      throw authError;
    }
    
    // Get table counts for diagnostics
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: requestCount } = await supabase
      .from('travel_requests')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({ 
      status: 'ok', 
      supabase: 'connected',
      database: {
        profiles: profileCount || 0,
        travel_requests: requestCount || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        supabase: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}