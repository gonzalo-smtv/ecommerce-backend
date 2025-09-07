import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '@app/products/products.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing shopping cart operations
 * Handles both anonymous and authenticated users' carts
 */
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  /**
   * Get or create a cart for a user or session
   * @param userId - Optional user ID for authenticated users
   * @param sessionId - Optional session ID for anonymous users
   * @returns The cart instance
   */
  async getOrCreateCart(userId?: number, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      // Find cart by user ID
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items', 'items.product'],
      });
    } else if (sessionId) {
      // Find cart by session ID (anonymous users)
      cart = await this.cartRepository.findOne({
        where: { sessionId },
        relations: ['items', 'items.product'],
      });
    }

    // Create a new cart if none exists
    if (!cart) {
      const newCart = new Cart();
      // @ts-expect-error TODO: check this
      newCart.userId = userId;
      // @ts-expect-error TODO: check this
      newCart.sessionId = sessionId || (userId ? null : uuidv4()); // Generate new sessionId if needed
      newCart.items = [];
      newCart.totalItems = 0;
      newCart.totalPrice = 0;

      cart = await this.cartRepository.save(newCart);
    }

    return cart;
  }

  /**
   * Add a product to the cart
   * @param userId - Optional user ID for authenticated users
   * @param sessionId - Optional session ID for anonymous users
   * @param addToCartDto - DTO with product ID and quantity
   * @returns Updated cart
   */
  async addToCart(
    userId: number | undefined,
    sessionId: string | undefined,
    addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Verify product exists
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check stock availability if implemented
    if (product.inStock === false) {
      throw new BadRequestException(`Product ${product.name} is out of stock`);
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Check if product is already in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
      existingItem.price = product.price * existingItem.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new item if it doesn't exist
      const cartItem = new CartItem();
      cartItem.cartId = cart.id;
      cartItem.productId = productId;
      cartItem.quantity = quantity;
      cartItem.price = product.price * quantity;
      cartItem.product = product;

      const savedItem = await this.cartItemRepository.save(cartItem);
      cart.items.push(savedItem);
    }

    // Update cart totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    return this.cartRepository.save(cart);
  }

  /**
   * Update quantity of a product in the cart
   * @param cartId - Cart ID
   * @param itemId - Cart item ID to update
   * @param updateCartItemDto - DTO with new quantity
   * @returns Updated cart
   */
  async updateCartItem(
    cartId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const { quantity } = updateCartItemDto;

    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const cartItem = cart.items.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    }

    // Update quantity and price
    cartItem.quantity = quantity;
    cartItem.price = cartItem.product.price * quantity;

    await this.cartItemRepository.save(cartItem);

    // Update cart totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    return this.cartRepository.save(cart);
  }

  // Remove a product from the cart
  async removeFromCart(cartId: number, itemId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Item with ID ${itemId} not found in the cart`,
      );
    }

    // Remove the item
    await this.cartItemRepository.delete(itemId);
    cart.items.splice(itemIndex, 1);

    // Update cart totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    return this.cartRepository.save(cart);
  }

  // Empty cart
  async clearCart(cartId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    // Remove all items
    await this.cartItemRepository.delete({ cartId });

    // Update cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    return this.cartRepository.save(cart);
  }

  // Merge carts (e.g., when an anonymous user authenticates)
  async mergeGuestCart(userId: number, sessionId: string): Promise<Cart> {
    // Find session cart
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.product'],
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    // Find or create user cart - no need to store in variable since we're not using it directly
    await this.getOrCreateCart(userId);

    // Add items from guest cart to user cart
    for (const item of guestCart.items) {
      await this.addToCart(userId, undefined, {
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Delete guest cart
    await this.cartRepository.delete(guestCart.id);

    // Return updated user cart
    return this.getOrCreateCart(userId);
  }
}
