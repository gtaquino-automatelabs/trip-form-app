import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/route', () => ({
  createServiceClient: vi.fn(),
}));

describe('/api/health', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/health');
    vi.clearAllMocks();
  });

  it('should return status ok when Supabase is connected', async () => {
    const { createServiceClient } = await import('@/lib/supabase/route');
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          head: true,
          count: 'exact'
        }))
      })),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    };
    
    // Setup the mock for the count queries
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 5 }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 10 }))
      });
    
    vi.mocked(createServiceClient).mockResolvedValue(mockSupabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.supabase).toBe('connected');
    expect(data.timestamp).toBeDefined();
    expect(data.database).toBeDefined();
  });

  it('should return status ok even when no session exists', async () => {
    const { createServiceClient } = await import('@/lib/supabase/route');
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          head: true,
          count: 'exact'
        }))
      })),
      auth: {
        getSession: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Auth session missing!' } 
        }),
      },
    };
    
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 0 }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 0 }))
      });
    
    vi.mocked(createServiceClient).mockResolvedValue(mockSupabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.supabase).toBe('connected');
  });

  it('should return error status when database connection fails', async () => {
    const { createServiceClient } = await import('@/lib/supabase/route');
    const mockError = new Error('Database connection failed');
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
        }))
      })),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    };
    vi.mocked(createServiceClient).mockResolvedValue(mockSupabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.supabase).toBe('disconnected');
    expect(data.error).toBe('Database connection failed');
    expect(data.timestamp).toBeDefined();
  });

  it('should handle unexpected errors gracefully', async () => {
    const { createServiceClient } = await import('@/lib/supabase/route');
    vi.mocked(createServiceClient).mockRejectedValue(new Error('Unexpected error'));

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.supabase).toBe('disconnected');
    expect(data.error).toBe('Unexpected error');
  });

  it('should verify response format matches specification', async () => {
    const { createServiceClient } = await import('@/lib/supabase/route');
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          head: true,
          count: 'exact'
        }))
      })),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    };
    
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 0 }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ count: 0 }))
      });
    
    vi.mocked(createServiceClient).mockResolvedValue(mockSupabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    // Verify exact format as specified in acceptance criteria
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('supabase');
    expect(['ok', 'error']).toContain(data.status);
    expect(['connected', 'disconnected']).toContain(data.supabase);
    
    // Additional properties that were added
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('database');
  });
});