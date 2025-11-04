import {
  Controller,
  Get,
  BadRequestException,
  Res,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CacheService } from '@app/cache/cache.service';
import type { IStorageService } from './storage.interface';
import { Inject } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { STORAGE_PATH } from '@app/utils/environments';
import { LOCAL_STORAGE } from './storage.service.local';

const readFileAsync = promisify(fs.readFile);

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(
    @Inject('StorageService')
    private readonly storageService: IStorageService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get image file',
    description: 'Returns the image file directly',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Path of the image file',
  })
  @ApiResponse({
    status: 200,
    description: 'Image file returned successfully',
  })
  async getImage(@Query('path') path: string, @Res() res: any) {
    const url = await this.storageService.getSignedUrl(path);
    let imageBuffer: Buffer<ArrayBufferLike> | null;
    if (path.startsWith(LOCAL_STORAGE)) {
      imageBuffer = await this.cacheService.getImage(url);
    } else {
      // For remote URLs, fetch directly without caching
      imageBuffer = await readFileAsync(
        url.replace(LOCAL_STORAGE, STORAGE_PATH),
      );
    }

    if (!imageBuffer) {
      throw new BadRequestException('Image not found or could not be loaded');
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.send(imageBuffer);
  }
}
