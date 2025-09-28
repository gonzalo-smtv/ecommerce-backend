import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductCategory } from '../../categories/entities/product-category.entity';

export class MigrateCategoriesScript {
  private dataSource: DataSource;
  private readonly logger = new Logger(MigrateCategoriesScript.name);

  constructor() {
    const configService = new ConfigService();
    this.dataSource = new DataSource({
      type: 'postgres',
      host: configService.get<string>('DB_HOST'),
      port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      entities: [Product, Category, ProductCategory],
      synchronize: false,
    });
  }

  async run() {
    this.logger.log('Starting categories migration...');

    try {
      await this.dataSource.initialize();
      this.logger.log('Database connection established');

      await this.migrateCategories();
      await this.migrateProductCategories();

      this.logger.log('Migration completed successfully');
    } catch (error) {
      this.logger.error('Error during migration', error);
    } finally {
      await this.dataSource.destroy();
    }
  }

  private async migrateCategories() {
    console.log('📂 Migrating categories...');

    // Get products with category data using raw query
    const products = await this.dataSource.query(`
      SELECT id, category, material, style, color
      FROM products
      WHERE category IS NOT NULL
         OR material IS NOT NULL
         OR style IS NOT NULL
         OR color IS NOT NULL
    `);

    console.log(`📊 Found ${products.length} products with category data`);

    // Create category map to avoid duplicates
    const categoryMap = new Map<string, Partial<Category>>();
    const materialSet = new Set<string>();
    const styleSet = new Set<string>();
    const colorSet = new Set<string>();

    // Process products and extract unique values
    for (const product of products) {
      // Main categories
      if (product.category) {
        const categories = product.category
          .split(',')
          .map((c: string) => c.trim());
        for (const category of categories) {
          if (category) {
            const slug = this.slugify(category);
            categoryMap.set(`main_${slug}`, {
              name: category,
              slug: slug,
              level: 1,
              is_active: true,
            });
          }
        }
      }

      // Materials
      if (product.material) {
        const materials = product.material
          .split(',')
          .map((m: string) => m.trim());
        for (const material of materials) {
          if (material) {
            materialSet.add(material.toLowerCase());
          }
        }
      }

      // Styles
      if (product.style) {
        const styles = product.style.split(',').map((s: string) => s.trim());
        for (const style of styles) {
          if (style) {
            styleSet.add(style.toLowerCase());
          }
        }
      }

      // Colors
      if (product.color) {
        const colors = product.color.split(',').map((c: string) => c.trim());
        for (const color of colors) {
          if (color) {
            colorSet.add(color.toLowerCase());
          }
        }
      }
    }

    this.logger.log('Creating main categories...');
    for (const [, categoryData] of categoryMap) {
      const existingCategory = await this.dataSource
        .getRepository(Category)
        .findOne({ where: { slug: categoryData.slug } });

      if (!existingCategory) {
        const category = this.dataSource
          .getRepository(Category)
          .create(categoryData);
        await this.dataSource.getRepository(Category).save(category);
        console.log(`✅ Category created: ${categoryData.name}`);
      }
    }

    this.logger.log('Creating material categories...');
    for (const material of materialSet) {
      const slug = this.slugify(material);
      const existingCategory = await this.dataSource
        .getRepository(Category)
        .findOne({ where: { slug } });

      if (!existingCategory) {
        const category = this.dataSource.getRepository(Category).create({
          name: this.capitalize(material),
          slug: slug,
          level: 2,
          is_active: true,
        });
        await this.dataSource.getRepository(Category).save(category);
        this.logger.log(`Material category created: ${category.name}`);
      }
    }

    this.logger.log('Creating style categories...');
    for (const style of styleSet) {
      const slug = this.slugify(style);
      const existingCategory = await this.dataSource
        .getRepository(Category)
        .findOne({ where: { slug } });

      if (!existingCategory) {
        const category = this.dataSource.getRepository(Category).create({
          name: this.capitalize(style),
          slug: slug,
          level: 2,
          is_active: true,
        });
        await this.dataSource.getRepository(Category).save(category);
        this.logger.log(`Style category created: ${category.name}`);
      }
    }

    this.logger.log('Creating color categories...');
    for (const color of colorSet) {
      const slug = this.slugify(color);
      const existingCategory = await this.dataSource
        .getRepository(Category)
        .findOne({ where: { slug } });

      if (!existingCategory) {
        const category = this.dataSource.getRepository(Category).create({
          name: this.capitalize(color),
          slug: slug,
          level: 2,
          is_active: true,
        });
        await this.dataSource.getRepository(Category).save(category);
        this.logger.log(`Color category created: ${category.name}`);
      }
    }
  }

  private async migrateProductCategories() {
    this.logger.log('Migrating product-category relationships...');

    const products = await this.dataSource.query(`
      SELECT id, name, category, material, style, color
      FROM products
      WHERE category IS NOT NULL
         OR material IS NOT NULL
         OR style IS NOT NULL
         OR color IS NOT NULL
    `);

    let migratedCount = 0;

    for (const product of products) {
      const productCategories: Partial<ProductCategory>[] = [];

      if (product.category) {
        const categories = product.category
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c);
        for (const categoryName of categories) {
          const category = await this.dataSource
            .getRepository(Category)
            .findOne({ where: { name: categoryName } });

          if (category) {
            productCategories.push({
              product_id: product.id,
              category_id: category.id,
              is_primary: categories.indexOf(categoryName) === 0,
            });
          }
        }
      }

      if (product.material) {
        const materials = product.material
          .split(',')
          .map((m: string) => m.trim().toLowerCase())
          .filter((m: string) => m);
        for (const material of materials) {
          const category = await this.dataSource
            .getRepository(Category)
            .findOne({ where: { name: this.capitalize(material) } });

          if (category) {
            productCategories.push({
              product_id: product.id,
              category_id: category.id,
              is_primary: false,
            });
          }
        }
      }

      if (product.style) {
        const styles = product.style
          .split(',')
          .map((s: string) => s.trim().toLowerCase())
          .filter((s: string) => s);
        for (const style of styles) {
          const category = await this.dataSource
            .getRepository(Category)
            .findOne({ where: { name: this.capitalize(style) } });

          if (category) {
            productCategories.push({
              product_id: product.id,
              category_id: category.id,
              is_primary: false,
            });
          }
        }
      }

      if (product.color) {
        const colors = product.color
          .split(',')
          .map((c: string) => c.trim().toLowerCase())
          .filter((c: string) => c);
        for (const color of colors) {
          const category = await this.dataSource
            .getRepository(Category)
            .findOne({ where: { name: this.capitalize(color) } });

          if (category) {
            productCategories.push({
              product_id: product.id,
              category_id: category.id,
              is_primary: false,
            });
          }
        }
      }

      if (productCategories.length > 0) {
        for (const productCategory of productCategories) {
          const existingRelation = await this.dataSource
            .getRepository(ProductCategory)
            .findOne({
              where: {
                product_id: productCategory.product_id,
                category_id: productCategory.category_id,
              },
            });

          if (!existingRelation) {
            const relation = this.dataSource
              .getRepository(ProductCategory)
              .create(productCategory);
            await this.dataSource.getRepository(ProductCategory).save(relation);
          }
        }
        migratedCount++;
      }
    }

    this.logger.log(`${migratedCount} products migrated with categories`);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private capitalize(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Ejecutar el script
if (require.main === module) {
  const script = new MigrateCategoriesScript();
  script.run();
}
