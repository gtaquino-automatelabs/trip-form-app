import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch the specific request
    const { data: travelRequest, error } = await supabase
      .from('travel_requests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Security: only fetch user's own requests
      .single();

    if (error) {
      console.error('Error fetching request:', error);

      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch request' },
        { status: 500 }
      );
    }

    if (!travelRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(travelRequest);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
