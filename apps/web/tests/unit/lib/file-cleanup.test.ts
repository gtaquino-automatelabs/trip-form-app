import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileCleanupService } from '@/lib/file-cleanup';
import { SupabaseClient } from '@supabase/supabase-js';

describe('FileCleanupService', () => {
  let service: FileCleanupService;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase = {
      storage: {
        from: vi.fn(() => ({
          list: vi.fn(),
          remove: vi.fn()
        }))
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    };
    
    service = new FileCleanupService(mockSupabase as SupabaseClient);
  });

  describe('findOrphanedFiles', () => {
    it('should find orphaned files older than threshold', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const recentDate = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      
      const mockFiles = [
        { name: 'user123/passport/old-file.jpg', created_at: oldDate.toISOString() },
        { name: 'user456/flights/recent-file.pdf', created_at: recentDate.toISOString() }
      ];

      mockSupabase.storage.from().list.mockResolvedValue({
        data: mockFiles,
        error: null
      });

      // Mock that all files are orphaned
      mockSupabase.from().select().or().limit.mockResolvedValue({
        data: [],
        error: null
      });

      const orphanedFiles = await service.findOrphanedFiles(60);

      expect(orphanedFiles).toHaveLength(1);
      expect(orphanedFiles[0].path).toBe('user123/passport/old-file.jpg');
      expect(orphanedFiles[0].userId).toBe('user123');
    });

    it('should handle empty file list', async () => {
      mockSupabase.storage.from().list.mockResolvedValue({
        data: [],
        error: null
      });

      const orphanedFiles = await service.findOrphanedFiles(60);

      expect(orphanedFiles).toHaveLength(0);
    });

    it('should handle list error gracefully', async () => {
      mockSupabase.storage.from().list.mockResolvedValue({
        data: null,
        error: { message: 'List failed' }
      });

      const orphanedFiles = await service.findOrphanedFiles(60);

      expect(orphanedFiles).toHaveLength(0);
    });

    it('should not include files that are referenced in travel requests', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const mockFiles = [
        { name: 'user123/passport/referenced-file.jpg', created_at: oldDate.toISOString() },
        { name: 'user123/passport/orphaned-file.jpg', created_at: oldDate.toISOString() }
      ];

      mockSupabase.storage.from().list.mockResolvedValue({
        data: mockFiles,
        error: null
      });

      // Mock that first file is referenced, second is orphaned
      mockSupabase.from().select().or().limit
        .mockResolvedValueOnce({
          data: [{ id: 'request-1' }], // Referenced
          error: null
        })
        .mockResolvedValueOnce({
          data: [], // Orphaned
          error: null
        });

      const orphanedFiles = await service.findOrphanedFiles(60);

      expect(orphanedFiles).toHaveLength(1);
      expect(orphanedFiles[0].path).toBe('user123/passport/orphaned-file.jpg');
    });
  });

  describe('deleteOrphanedFiles', () => {
    it('should delete orphaned files successfully', async () => {
      const orphanedFiles = [
        {
          path: 'user123/passport/file1.jpg',
          uploadedAt: new Date(),
          userId: 'user123'
        },
        {
          path: 'user456/flights/file2.pdf',
          uploadedAt: new Date(),
          userId: 'user456'
        }
      ];

      mockSupabase.storage.from().remove.mockResolvedValue({
        error: null
      });

      const result = await service.deleteOrphanedFiles(orphanedFiles);

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.storage.from().remove).toHaveBeenCalledTimes(2);
    });

    it('should handle deletion errors', async () => {
      const orphanedFiles = [
        {
          path: 'user123/passport/file1.jpg',
          uploadedAt: new Date(),
          userId: 'user123'
        },
        {
          path: 'user456/flights/file2.pdf',
          uploadedAt: new Date(),
          userId: 'user456'
        }
      ];

      mockSupabase.storage.from().remove
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      const result = await service.deleteOrphanedFiles(orphanedFiles);

      expect(result.success).toBe(false);
      expect(result.filesDeleted).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to delete user456/flights/file2.pdf');
    });
  });

  describe('runCleanup', () => {
    it('should run complete cleanup process', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const mockFiles = [
        { name: 'user123/passport/old-file.jpg', created_at: oldDate.toISOString() }
      ];

      mockSupabase.storage.from().list.mockResolvedValue({
        data: mockFiles,
        error: null
      });

      mockSupabase.from().select().or().limit.mockResolvedValue({
        data: [],
        error: null
      });

      mockSupabase.storage.from().remove.mockResolvedValue({
        error: null
      });

      const result = await service.runCleanup(60);

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle no orphaned files', async () => {
      mockSupabase.storage.from().list.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await service.runCleanup(60);

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('scheduleCleanup', () => {
    it('should run scheduled cleanup', async () => {
      const mockList = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockRemove = vi.fn();
      
      const mockSupabaseClient = {
        storage: {
          from: vi.fn(() => ({
            list: mockList,
            remove: mockRemove
          }))
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      };

      await FileCleanupService.scheduleCleanup(mockSupabaseClient as any);

      expect(mockList).toHaveBeenCalled();
    });
  });
});