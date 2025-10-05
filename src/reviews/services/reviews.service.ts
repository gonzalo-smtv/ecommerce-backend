import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Review, ReviewStatus } from '../entities/review.entity';
import { ProductRatingSummary } from '../entities/product-rating-summary.entity';
import { ReviewImage } from '../entities/review-image.entity';
import { User } from '../../users/entities/user.entity';
import { ProductVariation } from '../../products/entities/product-variation.entity';
import { Order } from '../../payments/entities/order.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewQueryDto } from '../dto/review-query.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ProductRatingSummary)
    private readonly ratingSummaryRepository: Repository<ProductRatingSummary>,
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductVariation)
    private readonly productVariationRepository: Repository<ProductVariation>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    // Verificar que el producto existe
    const productVariation = await this.productVariationRepository.findOne({
      where: { id: createReviewDto.productVariationId },
    });

    if (!productVariation) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario no haya reviewado este producto antes
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId,
        productVariationId: createReviewDto.productVariationId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Ya has reviewado este producto');
    }

    // Verificar compra si se marca como verified purchase
    let isVerifiedPurchase = false;
    let orderId = null;

    if (createReviewDto.productVariationId) {
      const order = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.items', 'item')
        .where('order.userId = :userId', { userId })
        .andWhere('item.productVariationId = :productVariationId', {
          productVariationId: createReviewDto.productVariationId,
        })
        .andWhere('order.status = :status', { status: 'completed' })
        .getOne();

      if (order) {
        isVerifiedPurchase = true;
        orderId = order.id;
      }
    }

    // Crear el review
    const reviewData: Partial<Review> = {
      userId,
      productVariationId: createReviewDto.productVariationId,
      title: createReviewDto.title,
      content: createReviewDto.content,
      rating: createReviewDto.rating,
      isVerifiedPurchase,
      status: ReviewStatus.PENDING, // Todos los reviews empiezan pendientes
    };

    if (orderId) {
      reviewData.orderId = orderId;
    }

    const review = this.reviewRepository.create(reviewData);
    const savedReview = await this.reviewRepository.save(review);

    // Crear imágenes si se proporcionaron
    if (createReviewDto.images && createReviewDto.images.length > 0) {
      const reviewImages = createReviewDto.images.map((imageUrl, index) =>
        this.reviewImageRepository.create({
          reviewId: savedReview.id,
          imageUrl,
          sortOrder: index,
        }),
      );
      await this.reviewImageRepository.save(reviewImages);
    }

    // Invalidar caché de ratings
    await this.invalidateRatingCache(createReviewDto.productVariationId);

    return this.findById(savedReview.id);
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'productVariation', 'images'],
    });

    if (!review) {
      throw new NotFoundException('Review no encontrado');
    }

    return review;
  }

  async findByProductVariationId(
    productVariationId: string,
    queryDto: ReviewQueryDto,
  ): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.images', 'images')
      .where('review.productVariationId = :productVariationId', {
        productVariationId,
      })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED });

    // Aplicar filtros
    if (queryDto.verifiedOnly) {
      queryBuilder.andWhere('review.isVerifiedPurchase = :verified', {
        verified: true,
      });
    }

    if (queryDto.minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: queryDto.minRating,
      });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(review.title ILIKE :search OR review.content ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    // Aplicar ordenamiento
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';
    queryBuilder.orderBy(
      `review.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Aplicar paginación
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return { reviews, total };
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.findById(id);

    // Verificar que el usuario sea el dueño del review
    if (review.userId !== userId) {
      throw new ForbiddenException('No puedes editar este review');
    }

    // Verificar que el review no esté aprobado aún (solo se pueden editar reviews pendientes)
    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException('No puedes editar un review ya aprobado');
    }

    // Actualizar el review
    Object.assign(review, updateReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    // Invalidar caché de ratings
    await this.invalidateRatingCache(review.productVariationId);

    return this.findById(savedReview.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findById(id);

    // Verificar que el usuario sea el dueño del review o admin
    if (review.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar este review');
    }

    await this.reviewRepository.remove(review);

    // Invalidar caché de ratings
    await this.invalidateRatingCache(review.productVariationId);
  }

  async markAsHelpful(reviewId: string): Promise<void> {
    const review = await this.findById(reviewId);

    // TODO: Implementar lógica para marcar como útil
    // Esto requeriría una tabla adicional para votos de utilidad
    // userId se usaría para evitar votos duplicados del mismo usuario

    review.helpfulVotes += 1;
    await this.reviewRepository.save(review);
  }

  async reportReview(reviewId: string): Promise<void> {
    const review = await this.findById(reviewId);

    review.reportCount += 1;
    review.status = ReviewStatus.FLAGGED;

    await this.reviewRepository.save(review);

    // TODO: Notificar a administradores sobre review reportado
    // TODO: Usar reason para categorizar el reporte
  }

  private async invalidateRatingCache(
    productVariationId: string,
  ): Promise<void> {
    const cacheKeys = [
      `rating:product:${productVariationId}`,
      `reviews:product:${productVariationId}:*`,
    ];

    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
  }

  async getCachedRatingSummary(
    productVariationId: string,
  ): Promise<ProductRatingSummary | null> {
    const cacheKey = `rating:product:${productVariationId}`;

    const cached = await this.cacheManager.get<ProductRatingSummary>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.calculateAndCacheRatingSummary(productVariationId);
  }

  private async calculateAndCacheRatingSummary(
    productVariationId: string,
  ): Promise<ProductRatingSummary | null> {
    // Calcular estadísticas reales desde la base de datos
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select([
        'COUNT(*) as total',
        'AVG(review.rating) as average',
        'SUM(CASE WHEN review.isVerifiedPurchase = true THEN 1 ELSE 0 END) as verified_count',
        'AVG(CASE WHEN review.isVerifiedPurchase = true THEN review.rating END) as verified_average',
      ])
      .addSelect(
        `
        jsonb_build_object(
          '1', COUNT(CASE WHEN review.rating = 1 THEN 1 END),
          '2', COUNT(CASE WHEN review.rating = 2 THEN 1 END),
          '3', COUNT(CASE WHEN review.rating = 3 THEN 1 END),
          '4', COUNT(CASE WHEN review.rating = 4 THEN 1 END),
          '5', COUNT(CASE WHEN review.rating = 5 THEN 1 END)
        ) as distribution
      `,
      )
      .where('review.productVariationId = :productVariationId', {
        productVariationId,
      })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    if (!result || parseInt(result.total) === 0) {
      return null;
    }

    const summary = this.ratingSummaryRepository.create({
      productVariationId,
      averageRating: parseFloat(result.average) || 0,
      totalReviews: parseInt(result.total),
      ratingDistribution: result.distribution,
      verifiedReviews: parseInt(result.verified_count) || 0,
      verifiedAverageRating: parseFloat(result.verified_average) || 0,
      lastCalculated: new Date(),
    });

    // Guardar en base de datos
    await this.ratingSummaryRepository.save(summary);

    // Cachear por 1 hora
    const cacheKey = `rating:product:${productVariationId}`;
    await this.cacheManager.set(cacheKey, summary, 3600);

    return summary;
  }
}
