import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from '@app/products/products.module';
import { UsersModule } from '@app/users/users.module';
import { AuthMiddleware } from '@app/auth/middleware/auth.middleware';

/**
 * Cart module for shopping cart functionality
 * Supports both authenticated users and anonymous sessions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [CartController],
  providers: [CartService, AuthMiddleware],
  exports: [CartService],
})
export class CartModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'cart', method: RequestMethod.ALL });
  }
}
