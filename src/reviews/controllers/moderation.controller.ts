import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ModerationService } from '../services/moderation.service';
import { Review } from '../entities/review.entity';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('Moderation')
@Controller('admin/reviews')
@UseGuards(AdminGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('pending')
  @ApiOperation({
    summary: 'Obtener reviews pendientes de moderación',
    description:
      'Obtiene una lista de reviews que requieren aprobación de moderador.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad máxima de reviews a retornar',
    example: 50,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Cantidad de reviews a saltar',
    example: 0,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reviews pendientes obtenida exitosamente',
    type: [Review],
  })
  async getPendingReviews(@Query() query: { limit?: number; offset?: number }) {
    return this.moderationService.getPendingReviews(
      query.limit || 50,
      query.offset || 0,
    );
  }

  @Get('flagged')
  @ApiOperation({
    summary: 'Obtener reviews reportados',
    description:
      'Obtiene una lista de reviews que han sido reportados por usuarios.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad máxima de reviews a retornar',
    example: 50,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Cantidad de reviews a saltar',
    example: 0,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reviews reportados obtenida exitosamente',
    type: [Review],
  })
  async getFlaggedReviews(@Query() query: { limit?: number; offset?: number }) {
    return this.moderationService.getFlaggedReviews(
      query.limit || 50,
      query.offset || 0,
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de moderación',
    description:
      'Obtiene estadísticas generales sobre el estado de los reviews.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        pending: { type: 'number' },
        approved: { type: 'number' },
        rejected: { type: 'number' },
        hidden: { type: 'number' },
        flagged: { type: 'number' },
      },
    },
  })
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar un review',
    description:
      'Aprueba un review pendiente, haciendo que sea visible públicamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a aprobar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review aprobado exitosamente',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review no encontrado',
  })
  async approveReview(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ): Promise<Review> {
    return this.moderationService.approveReview(id, req.user.id, body.reason);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar un review',
    description: 'Rechaza un review, evitando que sea visible públicamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a rechazar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review rechazado exitosamente',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review no encontrado',
  })
  async rejectReview(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ): Promise<Review> {
    return this.moderationService.rejectReview(id, req.user.id, body.reason);
  }

  @Post(':id/hide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ocultar un review',
    description:
      'Oculta un review aprobado, removiendo su visibilidad pública.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del review a ocultar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review ocultado exitosamente',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review no encontrado',
  })
  async hideReview(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ): Promise<Review> {
    return this.moderationService.hideReview(id, req.user.id, body.reason);
  }

  @Post('bulk/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar múltiples reviews',
    description: 'Aprueba múltiples reviews pendientes en una sola operación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews aprobados exitosamente',
    type: [Review],
  })
  async bulkApprove(
    @Body() body: { reviewIds: string[] },
    @Request() req: any,
  ): Promise<Review[]> {
    return this.moderationService.bulkApprove(body.reviewIds, req.user.id);
  }

  @Post('bulk/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar múltiples reviews',
    description: 'Rechaza múltiples reviews en una sola operación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews rechazados exitosamente',
    type: [Review],
  })
  async bulkReject(
    @Body() body: { reviewIds: string[]; reason: string },
    @Request() req: any,
  ): Promise<Review[]> {
    return this.moderationService.bulkReject(
      body.reviewIds,
      req.user.id,
      body.reason,
    );
  }
}
