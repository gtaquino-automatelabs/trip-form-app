import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Response types for consistent API format
interface ProjectsResponse {
  success: true;
  data: Array<{ id: string; name: string; }>;
}

interface ErrorResponse {
  success: false;
  error: { message: string; code: string; };
}

export async function GET(): Promise<NextResponse<ProjectsResponse | ErrorResponse>> {
  try {
    const supabase = await createClient();
    
    // Check authentication (required by RLS policies)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Authentication required to access projects',
            code: 'UNAUTHORIZED' 
          }
        },
        { status: 401 }
      );
    }

    // Query projetos table - select only needed fields for performance
    const { data: projetos, error } = await supabase
      .from('projetos')
      .select('id, nome')
      .order('nome', { ascending: true }); // Alphabetical sorting

    if (error) {
      console.error('Database error fetching projetos:', error);
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Failed to fetch projects from database',
            code: 'DATABASE_ERROR' 
          }
        },
        { status: 500 }
      );
    }

    // Transform to consistent format
    const projectList = (projetos || []).map(projeto => ({
      id: projeto.id,
      name: projeto.nome
    }));

    return NextResponse.json({
      success: true,
      data: projectList
    });

  } catch (error) {
    console.error('Unexpected error in projetos API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: { 
          message: 'Internal server error',
          code: 'INTERNAL_ERROR' 
        }
      },
      { status: 500 }
    );
  }
}
