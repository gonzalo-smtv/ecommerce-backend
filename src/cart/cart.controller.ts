import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { CartInfo } from './decorators/cart-info.decorator';
import { UsersService } from '../users/users.service';
import type { CartInfoType } from './types/cart-info.type';
// Express types for request handling

/**
 * Controller for cart operations
 * Handles both authenticated and anonymous shopping carts
 */
@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, description: 'Cart found', type: Cart })
  async getCart(@CartInfo() cartInfo: CartInfoType) {
    const { userId, sessionId } = cartInfo;
    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Product added successfully',
    type: Cart,
  })
  @ApiBody({ type: AddToCartDto })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @CartInfo() cartInfo: CartInfoType,
  ) {
    const { userId, sessionId } = cartInfo;
    return this.cartService.addToCart(userId, sessionId, addToCartDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update product quantity in cart' })
  @ApiResponse({ status: 200, description: 'Cart updated', type: Cart })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemDto })
  async updateCartItem(
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @CartInfo() cartInfo: CartInfoType,
  ) {
    const { userId, sessionId } = cartInfo;
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    const itemId = Number(id);
    if (isNaN(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }
    return this.cartService.updateCartItem(cart.id, itemId, updateCartItemDto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from cart',
    type: Cart,
  })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  async removeFromCart(
    @Param('id') id: number,
    @CartInfo() cartInfo: CartInfoType,
  ) {
    const { userId, sessionId } = cartInfo;
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    const itemId = Number(id);
    if (isNaN(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }
    return this.cartService.removeFromCart(cart.id, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared', type: Cart })
  async clearCart(@CartInfo() cartInfo: CartInfoType) {
    const { userId, sessionId } = cartInfo;
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    return this.cartService.clearCart(cart.id);
  }

  @Post('merge')
  @ApiOperation({
    summary: 'Merge guest cart with user cart when logging in',
  })
  @ApiResponse({
    status: 200,
    description: 'Carts merged successfully',
    type: Cart,
  })
  async mergeGuestCart(@Req() request: any) {
    const email = request.headers['x-user-email'];

    const sessionId =
      request.cookies?.sessionId || request.headers['x-session-id'];

    if (!email || !sessionId) {
      throw new BadRequestException(
        'User email and sessionId are required to merge carts',
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.cartService.mergeGuestCart(user.id, sessionId);
  }
}
