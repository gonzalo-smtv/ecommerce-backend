import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_KEY,
  SUPABASE_URL,
  SUPABASE_STORAGE_BUCKET,
} from '@app/utils/environments';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      this.logger.error('Supabase credentials not provided');
      throw new Error('Supabase credentials not provided');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.logger.log('Supabase client initialized');
  }

  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param path - Optional path within the bucket (e.g., 'products/')
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    path: string = '',
  ): Promise<{ url: string; path: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Create a unique file name to prevent overwriting existing files
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const fullPath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(fullPath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Error uploading file: ${error.message}`, error);
        throw new BadRequestException(`Error uploading file: ${error.message}`);
      }

      // Generate the public URL for the file
      const { data: urlData } = this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error: any) {
      this.logger.error(`Error in uploadFile: ${error.message}`, error);
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param filePath - The path of the file to delete
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      // Check if the image exists before attempting to delete
      const { data: fileExists } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .list(filePath);

      if (!fileExists || fileExists.length === 0) {
        this.logger.warn(`File not found: ${filePath}`);
        throw new BadRequestException(`File not found: ${filePath}`);
      }

      const { error } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        this.logger.error(`Error deleting file: ${error.message}`, error);
        throw new BadRequestException(`Error deleting file: ${error.message}`);
      }
    } catch (error: any) {
      this.logger.error(`Error in deleteFile: ${error.message}`, error);
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * List files in a directory
   * @param path - The directory path to list
   * @returns List of files
   */
  async listFiles(path: string = ''): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .list(path);

      if (error) {
        this.logger.error(`Error listing files: ${error.message}`, error);
        throw new BadRequestException(`Error listing files: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      this.logger.error(`Error in listFiles: ${error.message}`, error);
      throw new BadRequestException(`Error listing files: ${error.message}`);
    }
  }

  /**
   * Get a signed URL for temporary access
   * @param filePath - The path to the file
   * @param expiresIn - Expiration time in seconds
   * @returns The signed URL
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 60,
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        this.logger.error(`Error creating signed URL: ${error.message}`, error);
        throw new BadRequestException(
          `Error creating signed URL: ${error.message}`,
        );
      }

      return data.signedUrl;
    } catch (error: any) {
      this.logger.error(`Error in getSignedUrl: ${error.message}`, error);
      throw new BadRequestException(
        `Error creating signed URL: ${error.message}`,
      );
    }
  }

  /**
   * Clear all files from the storage bucket (development only)
   * @returns Number of files deleted
   */
  async clearAllFiles(): Promise<{ filesDeleted: number }> {
    try {
      this.logger.log('Starting storage cleanup...');

      // List all files in the bucket
      const { data: files, error: listError } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .list('', { limit: 1000 });

      if (listError) {
        this.logger.error(
          `Error listing files: ${listError.message}`,
          listError,
        );
        throw new BadRequestException(
          `Error listing files: ${listError.message}`,
        );
      }

      if (!files || files.length === 0) {
        this.logger.log('No files found in storage bucket');
        return { filesDeleted: 0 };
      }

      // Extract file paths for deletion
      const filePaths = files.map((file) => file.name);

      // Delete all files in batches
      const { error: deleteError } = await this.supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .remove(filePaths);

      if (deleteError) {
        this.logger.error(
          `Error deleting files: ${deleteError.message}`,
          deleteError,
        );
        throw new BadRequestException(
          `Error deleting files: ${deleteError.message}`,
        );
      }

      this.logger.log(
        `Successfully deleted ${files.length} files from storage`,
      );
      return { filesDeleted: files.length };
    } catch (error: any) {
      this.logger.error(`Error in clearAllFiles: ${error.message}`, error);
      throw error;
    }
  }
}
