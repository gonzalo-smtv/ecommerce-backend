export interface IStorageService {
  uploadFile(
    file: Express.Multer.File,
    path?: string,
  ): Promise<{ url: string; path: string }>;

  deleteFile(filePath: string): Promise<void>;

  listFiles(path?: string): Promise<any[]>;

  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;

  clearAllFiles(): Promise<{ filesDeleted: number }>;
}
