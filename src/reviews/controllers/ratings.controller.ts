import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { ProductRatingSummary } from '../entities/product-rating-summary.entity';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productVariationId/summary')
  @ApiOperation({
    summary: 'Obtener resumen de calificaciones de un producto',
    description:
      'Obtiene el resumen estadístico de calificaciones para un producto específico.',
  })
  @ApiParam({
    name: 'productVariationId',
    description: 'ID de la variación del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de calificaciones obtenido exitosamente',
    type: ProductRatingSummary,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado o sin calificaciones',
  })
  async getRatingSummary(
    @Param('productVariationId') productVariationId: string,
  ): Promise<ProductRatingSummary | null> {
    const summary =
      await this.reviewsService.getCachedRatingSummary(productVariationId);

    if (!summary) {
      throw new HttpException(
        'Producto no encontrado o sin calificaciones',
        HttpStatus.NOT_FOUND,
      );
    }

    return summary;
  }

  @Get('product/:productVariationId/distribution')
  @ApiOperation({
    summary: 'Obtener distribución de calificaciones',
    description:
      'Obtiene la distribución detallada de calificaciones (1-5 estrellas) para un producto.',
  })
  @ApiParam({
    name: 'productVariationId',
    description: 'ID de la variación del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribución de calificaciones obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        distribution: {
          type: 'object',
          properties: {
            1: {
              type: 'number',
              description: 'Cantidad de calificaciones de 1 estrella',
            },
            2: {
              type: 'number',
              description: 'Cantidad de calificaciones de 2 estrellas',
            },
            3: {
              type: 'number',
              description: 'Cantidad de calificaciones de 3 estrellas',
            },
            4: {
              type: 'number',
              description: 'Cantidad de calificaciones de 4 estrellas',
            },
            5: {
              type: 'number',
              description: 'Cantidad de calificaciones de 5 estrellas',
            },
          },
        },
        totalReviews: { type: 'number' },
        averageRating: { type: 'number' },
      },
    },
  })
  async getRatingDistribution(
    @Param('productVariationId') productVariationId: string,
  ) {
    const summary =
      await this.reviewsService.getCachedRatingSummary(productVariationId);

    if (!summary) {
      return {
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalReviews: 0,
        averageRating: 0,
      };
    }

    return {
      distribution: summary.ratingDistribution,
      totalReviews: summary.totalReviews,
      averageRating: summary.averageRating,
    };
  }

  @Get('top-rated')
  @ApiOperation({
    summary: 'Obtener productos mejor calificados',
    description:
      'Obtiene una lista de productos ordenados por calificación promedio.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad máxima de productos a retornar',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'minReviews',
    description: 'Cantidad mínima de reviews requerida',
    example: 5,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos mejor calificados obtenida exitosamente',
  })
  getTopRatedProducts(@Query() query: { limit?: number; minReviews?: number }) {
    // TODO: Implementar consulta para obtener productos top-rated
    // Esta funcionalidad requeriría una consulta más compleja que involucre
    // la tabla product_rating_summary y posiblemente product_variations

    return {
      message: 'Funcionalidad pendiente de implementar',
      limit: query.limit || 10,
      minReviews: query.minReviews || 1,
    };
  }
}
