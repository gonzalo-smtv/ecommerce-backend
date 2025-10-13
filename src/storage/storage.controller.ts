import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  Body,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { IStorageService } from './storage.interface';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(
    @Inject('StorageService')
    private readonly storageService: IStorageService,
  ) {}

  // ===== GET METHODS (Read Operations) =====

  @Get('list')
  @ApiOperation({
    summary: 'List files in storage',
    description: 'Lists files and directories in the specified path',
  })
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'Directory path to list',
  })
  @ApiResponse({
    status: 200,
    description: 'Files listed successfully',
  })
  async listFiles(@Query('path') path?: string) {
    return await this.storageService.listFiles(path);
  }

  @Get('url')
  @ApiOperation({
    summary: 'Get signed URL for file',
    description: 'Generates a signed URL for accessing a file',
  })
  @ApiParam({
    name: 'path',
    required: true,
    description: 'Path of the file to get URL for',
  })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    description: 'Expiration time in seconds (default: 60)',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The signed URL' },
      },
    },
  })
  async getSignedUrl(
    @Query('path') path: string,
    @Query('expiresIn') expiresIn?: number,
  ) {
    const expiration = expiresIn
      ? parseInt(expiresIn as unknown as string, 10)
      : 60;
    const url = await this.storageService.getSignedUrl(path, expiration);
    return { url };
  }

  // ===== POST METHODS (Create Operations) =====

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file',
    description: 'Uploads a file to storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No file uploaded',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { path?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.storageService.uploadFile(file, body.path);
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw error;
    }
  }

  // ===== DELETE METHODS (Delete Operations) =====

  @Delete('files/:path')
  @ApiOperation({
    summary: 'Delete a file',
    description: 'Deletes a file from storage',
  })
  @ApiParam({
    name: 'path',
    required: true,
    description: 'Path of the file to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File deleted successfully' },
      },
    },
  })
  async deleteFile(@Param('path') path: string) {
    await this.storageService.deleteFile(path);
    return { message: 'File deleted successfully' };
  }
}
