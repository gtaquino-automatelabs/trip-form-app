import { SupabaseClient } from '@supabase/supabase-js';

interface CleanupResult {
  success: boolean;
  filesDeleted: number;
  errors: string[];
}

interface OrphanedFile {
  path: string;
  uploadedAt: Date;
  userId: string;
}

/**
 * Service for cleaning up orphaned files (uploaded but not submitted)
 */
export class FileCleanupService {
  private supabase: SupabaseClient;
  private bucketName: string = 'travel-documents';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Find orphaned files that are not linked to any travel request
   */
  async findOrphanedFiles(olderThanMinutes: number = 60): Promise<OrphanedFile[]> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
      
      // List all files in the bucket
      const { data: files, error: listError } = await this.supabase.storage
        .from(this.bucketName)
        .list('', {
          limit: 1000,
          offset: 0
        });

      if (listError) {
        console.error('Error listing files:', listError);
        return [];
      }

      const orphanedFiles: OrphanedFile[] = [];

      // Check each file to see if it's orphaned
      for (const file of files || []) {
        // Skip if file is too recent
        const fileDate = new Date(file.created_at);
        if (fileDate > cutoffTime) {
          continue;
        }

        // Check if file is linked to a travel request
        const isOrphaned = await this.isFileOrphaned(file.name);
        
        if (isOrphaned) {
          orphanedFiles.push({
            path: file.name,
            uploadedAt: fileDate,
            userId: this.extractUserIdFromPath(file.name)
          });
        }
      }

      return orphanedFiles;
    } catch (error) {
      console.error('Error finding orphaned files:', error);
      return [];
    }
  }

  /**
   * Check if a file is orphaned (not linked to any travel request)
   */
  private async isFileOrphaned(filePath: string): Promise<boolean> {
    try {
      // Query the database to check if this file is referenced in any travel request
      // This would check the travel_requests table for any record containing this file path
      const { data, error } = await this.supabase
        .from('travel_requests')
        .select('id')
        .or(`passport_file.eq.${filePath},flight_documents.cs.${filePath}`)
        .limit(1);

      if (error) {
        console.error('Error checking file reference:', error);
        return false; // Don't delete if we can't verify
      }

      // If no records found, the file is orphaned
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking if file is orphaned:', error);
      return false; // Don't delete if we can't verify
    }
  }

  /**
   * Extract user ID from file path
   */
  private extractUserIdFromPath(filePath: string): string {
    // File paths are in format: userId/folder/filename
    const parts = filePath.split('/');
    return parts[0] || 'unknown';
  }

  /**
   * Delete orphaned files
   */
  async deleteOrphanedFiles(files: OrphanedFile[]): Promise<CleanupResult> {
    const errors: string[] = [];
    let filesDeleted = 0;

    for (const file of files) {
      try {
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .remove([file.path]);

        if (error) {
          errors.push(`Failed to delete ${file.path}: ${error.message}`);
        } else {
          filesDeleted++;
          console.log(`Deleted orphaned file: ${file.path}`);
        }
      } catch (error) {
        errors.push(`Error deleting ${file.path}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      filesDeleted,
      errors
    };
  }

  /**
   * Run the complete cleanup process
   */
  async runCleanup(olderThanMinutes: number = 60): Promise<CleanupResult> {
    console.log(`Starting file cleanup for files older than ${olderThanMinutes} minutes...`);
    
    // Find orphaned files
    const orphanedFiles = await this.findOrphanedFiles(olderThanMinutes);
    
    if (orphanedFiles.length === 0) {
      console.log('No orphaned files found');
      return {
        success: true,
        filesDeleted: 0,
        errors: []
      };
    }

    console.log(`Found ${orphanedFiles.length} orphaned files`);
    
    // Delete orphaned files
    const result = await this.deleteOrphanedFiles(orphanedFiles);
    
    console.log(`Cleanup complete. Deleted ${result.filesDeleted} files`);
    if (result.errors.length > 0) {
      console.error('Cleanup errors:', result.errors);
    }
    
    return result;
  }

  /**
   * Schedule periodic cleanup (to be called from a cron job or API route)
   * Note: This method requires a Supabase client to be passed in
   */
  static async scheduleCleanup(supabase: SupabaseClient): Promise<void> {
    const service = new FileCleanupService(supabase);
    
    // Run cleanup for files older than 1 hour
    await service.runCleanup(60);
  }
}