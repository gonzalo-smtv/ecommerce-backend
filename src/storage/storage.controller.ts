import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('05 - Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @Get('list')
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'Directory path to list',
  })
  async listFiles(@Query('path') path?: string) {
    return await this.storageService.listFiles(path);
  }

  @Get('url/:path')
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
  async getSignedUrl(
    @Param('path') path: string,
    @Query('expiresIn') expiresIn?: number,
  ) {
    const expiration = expiresIn
      ? parseInt(expiresIn as unknown as string, 10)
      : 60;
    const url = await this.storageService.getSignedUrl(path, expiration);
    return { url };
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        path: {
          type: 'string',
          description: 'Optional path within the bucket, e.g. "products/"',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('path') path?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.storageService.uploadFile(file, path);
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw error;
    }
  }

  @Delete('files/:path')
  @ApiParam({
    name: 'path',
    required: true,
    description: 'Path of the file to delete',
  })
  async deleteFile(@Param('path') path: string) {
    await this.storageService.deleteFile(path);
    return { message: 'File deleted successfully' };
  }
}
