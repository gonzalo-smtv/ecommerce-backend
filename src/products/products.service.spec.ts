import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductAttribute } from '../attributes/entities/product-attribute.entity';
import { StorageService } from '@app/storage/storage.service';
import { CacheService } from '@app/cache/cache.service';
import { NotFoundException } from '@nestjs/common';
import { createTestProduct } from '../../test/utils/factories';
import { createMockRepository } from '../../test/utils/test-setup';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Partial<Repository<Product>>;
  let productImageRepository: Partial<Repository<ProductImage>>;
  let productAttributeRepository: Partial<Repository<ProductAttribute>>;
  let storageService: Partial<StorageService>;
  let cacheService: Partial<CacheService>;

  beforeEach(async () => {
    // Create mock repositories
    productRepository = createMockRepository<Product>();
    productImageRepository = createMockRepository<ProductImage>();
    productAttributeRepository = createMockRepository<ProductAttribute>();

    // Create mock services
    storageService = {
      deleteFile: jest.fn(),
    };

    cacheService = {
      getImage: jest.fn(),
      invalidateCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: productImageRepository,
        },
        {
          provide: getRepositoryToken(ProductAttribute),
          useValue: productAttributeRepository,
        },
        {
          provide: StorageService,
          useValue: storageService,
        },
        {
          provide: CacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        createTestProduct({ id: '1', name: 'Product 1' }),
        createTestProduct({ id: '2', name: 'Product 2' }),
      ];

      (productRepository.find as jest.Mock).mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(productRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const mockProduct = createTestProduct({ id: '1', name: 'Test Product' });

      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const productData = createTestProduct({ name: 'New Product' });
      const savedProduct = { ...productData, id: 'generated-id' };

      (productRepository.create as jest.Mock).mockReturnValue(productData);
      (productRepository.save as jest.Mock).mockResolvedValue(savedProduct);
      (productRepository.findOne as jest.Mock).mockResolvedValue(savedProduct);

      const result = await service.create(productData);

      expect(result).toEqual(savedProduct);
      expect(productRepository.create).toHaveBeenCalledWith(productData);
      expect(productRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const existingProduct = createTestProduct({ id: '1', name: 'Old Name' });
      const updateData = { name: 'Updated Name' };
      const updatedProduct = { ...existingProduct, ...updateData };

      (productRepository.findOne as jest.Mock).mockResolvedValue(
        existingProduct,
      );
      (productRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateData);

      expect(result).toEqual(updatedProduct);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(productRepository.save).toHaveBeenCalledWith(updatedProduct);
    });
  });

  describe('delete', () => {
    it('should delete a product and its images', async () => {
      const product = createTestProduct({ id: '1' });
      const mockImages = [
        { id: 'img1', path: 'path1', url: 'url1' },
        { id: 'img2', path: 'path2', url: 'url2' },
      ];

      (productRepository.findOne as jest.Mock).mockResolvedValue(product);
      (productImageRepository.find as jest.Mock).mockResolvedValue(mockImages);
      (productRepository.remove as jest.Mock).mockResolvedValue(undefined);

      await service.delete('1');

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(productImageRepository.find).toHaveBeenCalledWith({
        where: { productId: '1' },
      });
      expect(storageService.deleteFile).toHaveBeenCalledWith('path1');
      expect(storageService.deleteFile).toHaveBeenCalledWith('path2');
      expect(cacheService.invalidateCache).toHaveBeenCalledWith('url1');
      expect(cacheService.invalidateCache).toHaveBeenCalledWith('url2');
      expect(productRepository.remove).toHaveBeenCalledWith(product);
    });
  });
});
