import { ProductVariation } from '../../src/products/entities/product-variation.entity';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { Cart } from '../../src/cart/entities/cart.entity';
import { CartItem } from '../../src/cart/entities/cart-item.entity';
import { Category } from '../../src/categories/entities/category.entity';

// ProductVariation factory
export function createTestProductVariation(
  overrides: Partial<ProductVariation> = {},
): Partial<ProductVariation> {
  return {
    id: 'test-product-id',
    template_id: 'test-template-id',
    sku: 'TEST-SKU',
    name: 'Test ProductVariation',
    price: 99,
    stock: 10,
    is_active: true,
    sort_order: 0,
    created_at: new Date(),
    updated_at: new Date(),
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
    productVariationId: 'test-product-id',
    quantity: 2,
    price: 99,
    ...overrides,
  };
}

// Factory for creating multiple products
export function createTestProductVariations(
  count: number,
  overrides: Partial<ProductVariation> = {},
): Partial<ProductVariation>[] {
  return Array.from({ length: count }, (_, index) =>
    createTestProductVariation({
      id: `test-product-${index + 1}`,
      name: `Test ProductVariation ${index + 1}`,
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

// Category factory
export function createTestCategory(
  overrides: Partial<Category> = {},
): Partial<Category> {
  return {
    id: 'test-category-id',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test category description',
    parentId: undefined,
    level: 1,
    image: undefined,
    icon: undefined,
    is_active: true,
    sort_order: 0,
    meta_title: undefined,
    meta_description: undefined,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

// Factory for creating root category (no parent)
export function createTestRootCategory(
  overrides: Partial<Category> = {},
): Partial<Category> {
  return createTestCategory({
    id: 'test-root-category-id',
    name: 'Root Category',
    slug: 'root-category',
    level: 1,
    parentId: undefined,
    ...overrides,
  });
}

// Factory for creating child category
export function createTestChildCategory(
  parentId: string,
  overrides: Partial<Category> = {},
): Partial<Category> {
  return createTestCategory({
    id: 'test-child-category-id',
    name: 'Child Category',
    slug: 'child-category',
    level: 2,
    parentId,
    ...overrides,
  });
}

// Factory for creating multiple categories
export function createTestCategories(
  count: number,
  overrides: Partial<Category> = {},
): Partial<Category>[] {
  return Array.from({ length: count }, (_, index) =>
    createTestCategory({
      id: `test-category-${index + 1}`,
      name: `Test Category ${index + 1}`,
      slug: `test-category-${index + 1}`,
      ...overrides,
    }),
  );
}

// Factory for creating category tree structure
export function createTestCategoryTree(): {
  root: Partial<Category>;
  children: Partial<Category>[];
  grandchildren: Partial<Category>[];
} {
  const root = createTestRootCategory({
    id: 'root-category',
    name: 'Electronics',
    slug: 'electronics',
  });

  const children = [
    createTestChildCategory(root.id!, {
      id: 'laptops-category',
      name: 'Laptops',
      slug: 'laptops',
    }),
    createTestChildCategory(root.id!, {
      id: 'phones-category',
      name: 'Phones',
      slug: 'phones',
    }),
  ];

  const grandchildren = [
    createTestChildCategory(children[0].id!, {
      id: 'gaming-laptops-category',
      name: 'Gaming Laptops',
      slug: 'gaming-laptops',
    }),
  ];

  return { root, children, grandchildren };
}
