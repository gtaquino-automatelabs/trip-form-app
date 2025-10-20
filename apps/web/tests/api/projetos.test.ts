import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/projetos/route';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('/api/projetos', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    };
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock failed authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required to access projects');
    });

    it('should return 401 when user object is null', async () => {
      // Mock successful call but no user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Successful requests', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return empty array when no projects exist', async () => {
      // Mock empty projects response
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should return projects list with correct format', async () => {
      const mockProjects = [
        { id: 'proj-1', nome: 'Projeto Alpha' },
        { id: 'proj-2', nome: 'Projeto Beta' },
        { id: 'proj-3', nome: 'Projeto Gamma' },
      ];

      // Mock projects response
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockProjects, error: null })),
        })),
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([
        { id: 'proj-1', name: 'Projeto Alpha' },
        { id: 'proj-2', name: 'Projeto Beta' },
        { id: 'proj-3', name: 'Projeto Gamma' },
      ]);
    });

    it('should call correct Supabase query with proper parameters', async () => {
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      }));
      const mockOrder = vi.fn(() => Promise.resolve({ data: [], error: null }));

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      await GET();

      // Verify correct table and query parameters
      expect(mockSupabase.from).toHaveBeenCalledWith('projetos');
      expect(mockSelect).toHaveBeenCalledWith('id, nome');
      expect(mockOrder).toHaveBeenCalledWith('nome', { ascending: true });
    });
  });

  describe('Database errors', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should handle database query errors', async () => {
      const mockError = { message: 'Database connection failed', code: 'DB_ERROR' };

      // Mock database error
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
        })),
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DATABASE_ERROR');
      expect(data.error.message).toBe('Failed to fetch projects from database');
    });

    it('should handle null data response gracefully', async () => {
      // Mock null response (no error, but no data)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe('Unexpected errors', () => {
    it('should handle unexpected errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockRejectedValue(new Error('Unexpected server error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Internal server error');
    });
  });

  describe('Response format validation', () => {
    it('should match ProjectsResponse interface for success', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockProjects = [{ id: 'proj-1', nome: 'Test Project' }];
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockProjects, error: null })),
        })),
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      // Verify exact ProjectsResponse format
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('id');
        expect(data.data[0]).toHaveProperty('name');
        expect(typeof data.data[0].id).toBe('string');
        expect(typeof data.data[0].name).toBe('string');
      }
    });

    it('should match ErrorResponse interface for errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      // Verify exact ErrorResponse format
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('message');
      expect(data.error).toHaveProperty('code');
      expect(typeof data.error.message).toBe('string');
      expect(typeof data.error.code).toBe('string');
    });
  });
});
