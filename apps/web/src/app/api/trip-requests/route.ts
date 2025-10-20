import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: requests, error } = await supabase
      .from('travel_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json(requests || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Format dates to ISO string if they're Date objects
    const formattedBody = {
      ...body,
      user_id: user.id,
      start_date: body.start_date instanceof Date 
        ? body.start_date.toISOString() 
        : body.start_date,
      end_date: body.end_date instanceof Date 
        ? body.end_date.toISOString() 
        : body.end_date,
    };

    const { data: newRequest, error } = await supabase
      .from('travel_requests')
      .insert([formattedBody])
      .select()
      .single();

    if (error) {
      console.error('Error creating request:', error);
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      );
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}