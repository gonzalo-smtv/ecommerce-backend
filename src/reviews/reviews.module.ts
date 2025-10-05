import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ReviewsController } from './controllers/reviews.controller';
import { RatingsController } from './controllers/ratings.controller';
import { ModerationController } from './controllers/moderation.controller';
import { ReviewsService } from './services/reviews.service';
import { ModerationService } from './services/moderation.service';
import { Review } from './entities/review.entity';
import { ProductRatingSummary } from './entities/product-rating-summary.entity';
import { ReviewImage } from './entities/review-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ProductRatingSummary, ReviewImage]),
    CacheModule.register(),
  ],
  controllers: [ReviewsController, RatingsController, ModerationController],
  providers: [ReviewsService, ModerationService],
  exports: [ReviewsService, ModerationService],
})
export class ReviewsModule {}
