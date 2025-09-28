import { Product } from '../../src/products/entities/product.entity';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { Category } from '../../src/categories/entities/category.entity';
import { Cart } from '../../src/cart/entities/cart.entity';
import { CartItem } from '../../src/cart/entities/cart-item.entity';

// Product factory
export function createTestProduct(
  overrides: Partial<Product> = {},
): Partial<Product> {
  return {
    id: 'test-product-id',
    name: 'Test Product',
    price: 99.99,
    description: 'This is a test product description',
    dimensions: '10x10x10',
    weight: 1.5,
    inStock: true,
    rating: 4.5,
    reviewCount: 10,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// User factory
export function createTestUser(overrides: Partial<User> = {}): Partial<User> {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CUSTOMER,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Category factory
export function createTestCategory(
  overrides: Partial<Category> = {},
): Partial<Category> {
  return {
    id: 'test-category-id',
    name: 'Test Category',
    slug: 'test-category',
    description: 'This is a test category',
    image: 'test-image.jpg',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

// Cart factory
export function createTestCart(overrides: Partial<Cart> = {}): Partial<Cart> {
  return {
    id: 'test-cart-id',
    sessionId: 'test-session-id',
    userId: 'test-user-id',
    totalItems: 2,
    totalPrice: 199.98,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// CartItem factory
export function createTestCartItem(
  overrides: Partial<CartItem> = {},
): Partial<CartItem> {
  return {
    id: 'test-cart-item-id',
    cartId: 'test-cart-id',
    productId: 'test-product-id',
    quantity: 2,
    price: 99.99,
    ...overrides,
  };
}

// Factory for creating multiple products
export function createTestProducts(
  count: number,
  overrides: Partial<Product> = {},
): Partial<Product>[] {
  return Array.from({ length: count }, (_, index) =>
    createTestProduct({
      id: `test-product-${index + 1}`,
      name: `Test Product ${index + 1}`,
      ...overrides,
    }),
  );
}

// Factory for creating multiple users
export function createTestUsers(
  count: number,
  overrides: Partial<User> = {},
): Partial<User>[] {
  return Array.from({ length: count }, (_, index) =>
    createTestUser({
      id: `test-user-${index + 1}`,
      email: `test${index + 1}@example.com`,
      ...overrides,
    }),
  );
}
