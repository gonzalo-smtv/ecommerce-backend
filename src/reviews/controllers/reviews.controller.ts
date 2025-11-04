import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from '../entities/review.entity';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { UserInfo } from '../../auth/decorators/user-info.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las reviews',
    description: 'Obtiene todas las reviews del sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reviews obtenida exitosamente',
    type: [Review],
  })
  async findAll(): Promise<Review[]> {
    return this.reviewsService.findAll();
  }
  @Post()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({
    summary: 'Crear un nuevo review',
    description:
      'Crea un nuevo review para un producto. Requiere autenticación por provider externo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Review creado exitosamente',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o usuario ya reviewó este producto',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @UserInfo() userInfo: any,
  ): Promise<Review> {
    return this.reviewsService.create(createReviewDto, userInfo.userId);
  }

  @Post(':id/helpful')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar review como útil',
    description:
      'Marca un review como útil. Requiere autenticación por provider externo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review marcado como útil',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  async markAsHelpful(@Param('id') id: string): Promise<void> {
    await this.reviewsService.markAsHelpful(id);
  }

  @Post(':id/report')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reportar un review',
    description:
      'Reporta un review inapropiado. Requiere autenticación por provider externo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a reportar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review reportado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  async reportReview(@Param('id') id: string): Promise<void> {
    await this.reviewsService.reportReview(id);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({
    summary: 'Actualizar un review',
    description:
      'Actualiza un review existente. Requiere autenticación por provider externo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review actualizado exitosamente',
    type: Review,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para editar este review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UserInfo() userInfo: any,
  ): Promise<Review> {
    return this.reviewsService.update(id, updateReviewDto, userInfo.userId);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un review',
    description:
      'Elimina un review existente. Requiere autenticación por provider externo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Review eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para eliminar este review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review no encontrado',
  })
  async remove(
    @Param('id') id: string,
    @UserInfo() userInfo: any,
  ): Promise<void> {
    await this.reviewsService.remove(id, userInfo.userId);
  }
}
