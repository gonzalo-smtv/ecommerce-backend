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

      expect(response.body).toMatchObject([
        {
          id: root.id,
          name: root.name,
          slug: root.slug,
          children: children.map((child) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            children: grandchildren
              .filter((gc) => gc.parentId === child.id)
              .map((gc) => ({
                id: gc.id,
                name: gc.name,
                slug: gc.slug,
              })),
          })),
        },
      ]);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category successfully', async () => {
      const newCategory = createTestRootCategory({
        id: undefined,
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
  });

  describe.skip('POST /categories/:id/move', () => {
    it('should move category successfully', async () => {
      const categoryId = 'category-to-move';
      const newParentId = 'new-parent-id';
      const category = createTestCategory({ id: categoryId, level: 1 });
      const newParent = createTestCategory({ id: newParentId, level: 1 });

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find category to move
        .mockResolvedValueOnce(newParent); // Find new parent

      const updatedCategory = {
        ...category,
        parentId: newParentId,
        level: 2,
      };
      mockRepository.save.mockResolvedValue(updatedCategory);

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
  });

  describe.skip('PATCH /categories/:id', () => {
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

      const updatedCategory = { ...category, ...updateData };

      const mockRepository = categoryRepository as any;
      mockRepository.findOne
        .mockResolvedValueOnce(category) // Find existing category
        .mockResolvedValueOnce(null) // No slug conflict
        .mockResolvedValueOnce(updatedCategory); // Return updated

      mockRepository.save.mockResolvedValue(updatedCategory);

      const response = await request
        .patch(`/categories/${categoryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
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
  });

  describe('DELETE /categories/delete-all', () => {
    it('should delete all categories successfully', async () => {
      const categories = createTestCategories(3);

      const mockRepository = categoryRepository as any;
      mockRepository.find.mockResolvedValue(categories);
      mockRepository.remove.mockResolvedValue(undefined);

      const response = await request.get('/categories/tree').expect(200);
      expect(response.body.length).toBe(3);

      await request.delete('/categories/delete-all').expect(204);
    });
  });
});
