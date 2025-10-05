import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesModule } from './categories.module';
import { Category } from './entities/category.entity';
import {
  createTestCategory,
  createTestRootCategory,
  createTestChildCategory,
  createTestCategoryTree,
  createTestCategories,
} from '../../test/utils/factories';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let request: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoriesModule],
    })
      .overrideProvider(getRepositoryToken(Category))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        count: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn(),
          getOne: jest.fn(),
          getRawMany: jest.fn(),
          getRawOne: jest.fn(),
        })),
      } as unknown as Partial<Repository<Category>>)
      .compile();

    app = moduleFixture.createNestApplication();
    categoryRepository = moduleFixture.get<Repository<Category>>(
      getRepositoryToken(Category),
    );

    await app.init();
    request = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /categories/tree', () => {
    it('should return empty array when no categories exist', async () => {
      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue([]);

      const response = await request.get('/categories/tree').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return category tree with root categories and children', async () => {
      const { root, children, grandchildren } = createTestCategoryTree();
      const allCategories = [root, ...children, ...grandchildren];

      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue(allCategories);

      const response = await request.get('/categories/tree').expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return categories sorted by level, sort_order, and name', async () => {
      const categories = createTestCategories(3, {
        level: 1,
        sort_order: 0,
      });

      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue(categories);

      const response = await request.get('/categories/tree').expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /categories/:id/products', () => {
    it('should return products for a category', async () => {
      const categoryId = 'test-category-id';

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(createTestCategory());

      const response = await request
        .get(`/categories/${categoryId}/products`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('categoryId', categoryId);
      expect(response.body[0]).toHaveProperty('products');
      expect(response.body[0]).toHaveProperty('totalCount');
    });

    it('should return 404 when category does not exist', async () => {
      const categoryId = 'non-existent-id';

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(null);

      await request.get(`/categories/${categoryId}/products`).expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should create a new root category successfully', async () => {
      const newCategory = createTestRootCategory({
        id: undefined, // Remove id for creation
        name: 'New Category',
        slug: 'new-category',
      });

      const savedCategory = {
        ...newCategory,
        id: 'generated-id',
      };

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing slug
        .mockResolvedValueOnce(null) // No parent
        .mockResolvedValueOnce(savedCategory); // Return saved category

      mockRepository.create.mockReturnValue(newCategory);
      mockRepository.save.mockResolvedValue(savedCategory);

      const response = await request
        .post('/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newCategory.name);
      expect(response.body.slug).toBe(newCategory.slug);
    });

    it('should create a child category with valid parent', async () => {
      const parentCategory = createTestRootCategory({
        id: 'parent-id',
        level: 1,
      });

      const childCategory = createTestChildCategory('parent-id', {
        id: undefined,
        name: 'Child Category',
        slug: 'child-category',
        level: 2,
      });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing slug
        .mockResolvedValueOnce(parentCategory) // Parent exists
        .mockResolvedValueOnce(childCategory); // Return saved category

      mockRepository.create.mockReturnValue(childCategory);
      mockRepository.save.mockResolvedValue(childCategory);

      const response = await request
        .post('/categories')
        .send(childCategory)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.level).toBe(2);
      expect(response.body.parentId).toBe('parent-id');
    });

    it('should return 400 when slug already exists', async () => {
      const existingCategory = createTestCategory({
        slug: 'existing-slug',
      });

      const newCategory = createTestCategory({
        id: undefined,
        slug: 'existing-slug',
      });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(existingCategory);

      await request.post('/categories').send(newCategory).expect(400);
    });

    it('should return 404 when parent category does not exist', async () => {
      const childCategory = createTestChildCategory('non-existent-parent', {
        id: undefined,
      });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing slug
        .mockResolvedValueOnce(null); // Parent doesn't exist

      await request.post('/categories').send(childCategory).expect(404);
    });

    it('should return 400 for invalid category data', async () => {
      const invalidCategory = {
        // Missing required fields
        description: 'Invalid category',
      };

      await request.post('/categories').send(invalidCategory).expect(400);
    });
  });

  describe('POST /categories/:id/move', () => {
    it('should move category to new parent successfully', async () => {
      const categoryId = 'category-to-move';
      const newParentId = 'new-parent-id';
      const category = createTestCategory({ id: categoryId, level: 1 });
      const newParent = createTestCategory({ id: newParentId, level: 1 });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find category to move
        .mockResolvedValueOnce(newParent); // Find new parent

      mockRepository.save.mockResolvedValue({
        ...category,
        parentId: newParentId,
        level: 2,
      });

      const moveData = {
        parentId: newParentId,
      };

      const response = await request
        .post(`/categories/${categoryId}/move`)
        .send(moveData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.parentId).toBe(newParentId);
      expect(response.body.level).toBe(2);
    });

    it('should move category within same parent with new sort order', async () => {
      const categoryId = 'category-to-move';
      const category = createTestCategory({ id: categoryId, sort_order: 1 });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.save.mockResolvedValue({
        ...category,
        sort_order: 5,
      });

      const moveData = {
        sortOrder: 5,
      };

      const response = await request
        .post(`/categories/${categoryId}/move`)
        .send(moveData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.sort_order).toBe(5);
    });

    it('should return 400 when trying to set category as its own parent', async () => {
      const categoryId = 'category-id';

      const moveData = {
        parentId: categoryId, // Same as category ID
      };

      await request
        .post(`/categories/${categoryId}/move`)
        .send(moveData)
        .expect(400);
    });

    it('should return 404 when new parent does not exist', async () => {
      const categoryId = 'category-to-move';
      const category = createTestCategory({ id: categoryId });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find category
        .mockResolvedValueOnce(null); // Parent doesn't exist

      const moveData = {
        parentId: 'non-existent-parent',
      };

      await request
        .post(`/categories/${categoryId}/move`)
        .send(moveData)
        .expect(404);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update category successfully', async () => {
      const categoryId = 'category-to-update';
      const category = createTestCategory({
        id: categoryId,
        name: 'Original Name',
        slug: 'original-slug',
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find existing category
        .mockResolvedValueOnce(null) // No slug conflict
        .mockResolvedValueOnce({ ...category, ...updateData }); // Return updated

      mockRepository.save.mockResolvedValue({ ...category, ...updateData });

      const response = await request
        .patch(`/categories/${categoryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 400 when updating to existing slug', async () => {
      const categoryId = 'category-to-update';
      const category = createTestCategory({
        id: categoryId,
        slug: 'original-slug',
      });
      const existingCategory = createTestCategory({ slug: 'existing-slug' });

      const updateData = {
        slug: 'existing-slug',
      };

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find existing category
        .mockResolvedValueOnce(existingCategory); // Slug already exists

      await request
        .patch(`/categories/${categoryId}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 404 when category to update does not exist', async () => {
      const categoryId = 'non-existent-category';

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(null);

      await request
        .patch(`/categories/${categoryId}`)
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete category successfully', async () => {
      const categoryId = 'category-to-delete';
      const category = createTestCategory({ id: categoryId });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.count.mockResolvedValue(0); // No children
      mockRepository.remove.mockResolvedValue(undefined);

      await request.delete(`/categories/${categoryId}`).expect(204);
    });

    it('should return 400 when trying to delete category with children', async () => {
      const categoryId = 'parent-category';
      const category = createTestCategory({ id: categoryId });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.count.mockResolvedValue(2); // Has children

      await request.delete(`/categories/${categoryId}`).expect(400);
    });

    it('should return 404 when category to delete does not exist', async () => {
      const categoryId = 'non-existent-category';

      const mockRepository = categoryRepository as any;
      mockRepository.findOne.mockResolvedValue(null);

      await request.delete(`/categories/${categoryId}`).expect(404);
    });
  });

  describe('DELETE /categories/delete-all', () => {
    it('should delete all categories successfully', async () => {
      const categories = createTestCategories(3);

      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue(categories);
      mockRepository.remove.mockResolvedValue(undefined);

      await request.delete('/categories/delete-all').expect(204);
    });

    it('should handle empty categories list', async () => {
      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue([]);
      mockRepository.remove.mockResolvedValue(undefined);

      await request.delete('/categories/delete-all').expect(204);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex category tree operations', async () => {
      const { root, children, grandchildren } = createTestCategoryTree();
      const allCategories = [root, ...children, ...grandchildren];

      // Test creating root category
      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No slug conflict for root
        .mockResolvedValueOnce(null) // No parent for root
        .mockResolvedValueOnce(root);

      mockRepository.create.mockReturnValue(root);
      mockRepository.save.mockResolvedValue(root);

      const createResponse = await request
        .post('/categories')
        .send(root)
        .expect(201);

      expect(createResponse.body).toBeDefined();

      // Test creating child category
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No slug conflict for child
        .mockResolvedValueOnce(root) // Parent exists
        .mockResolvedValueOnce(children[0]);

      mockRepository.create.mockReturnValue(children[0]);
      mockRepository.save.mockResolvedValue(children[0]);

      const childResponse = await request
        .post('/categories')
        .send(children[0])
        .expect(201);

      expect(childResponse.body).toBeDefined();
      expect(childResponse.body.parentId).toBe(root.id);
      expect(childResponse.body.level).toBe(2);

      // Test getting category tree
      mockRepository.find.mockResolvedValue(allCategories);

      const treeResponse = await request.get('/categories/tree').expect(200);

      expect(treeResponse.body).toBeDefined();
      expect(Array.isArray(treeResponse.body)).toBe(true);
    });
  });
});
