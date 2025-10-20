import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for passenger profile
const passengerProfileSchema = z.object({
  passengerName: z.string().min(1),
  passengerEmail: z.string().email(),
  rg: z.string().min(1),
  rgIssuer: z.string().min(1),
  cpf: z.string().min(11),
  birthDate: z.string(), // ISO date string
  phone: z.string().min(10),
  bankName: z.string().min(1),
  bankBranch: z.string().min(1),
  bankAccount: z.string().min(1),
});

export type PassengerProfile = z.infer<typeof passengerProfileSchema>;

// GET - Retrieve saved passenger profile
export async function GET() {
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

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Extract passenger profile from metadata
    const passengerProfile = profile?.metadata?.passengerProfile || null;

    return NextResponse.json({
      success: true,
      profile: passengerProfile
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save passenger profile
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = passengerProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Fetch current metadata
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Merge new passenger profile with existing metadata
    const updatedMetadata = {
      ...(currentProfile?.metadata || {}),
      passengerProfile: {
        ...profileData,
        savedAt: new Date().toISOString()
      }
    };

    // Update profile metadata
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear saved passenger profile
export async function DELETE() {
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

    // Fetch current metadata
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Remove passengerProfile from metadata
    const updatedMetadata = {
      ...(currentProfile?.metadata || {}),
    };
    delete updatedMetadata.passengerProfile;

    // Update profile metadata
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to clear profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile cleared successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
