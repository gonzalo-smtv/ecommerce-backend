import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from '@app/products/products.module';
import { UsersModule } from '@app/users/users.module';
import { CartSessionMiddleware } from './middleware/cart-session.middleware';

/**
 * Module for cart functionality
 * Handles both authenticated and anonymous shopping carts
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CartSessionMiddleware)
      .forRoutes({ path: 'cart*', method: RequestMethod.ALL });
  }
}
