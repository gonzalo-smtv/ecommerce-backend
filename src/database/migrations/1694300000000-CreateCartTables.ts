import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCartTables1694300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla carts
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'totalItems',
            type: 'int',
            default: 0,
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Crear tabla cart_items
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'cartId',
            type: 'int',
          },
          {
            name: 'productId',
            type: 'int',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
        ],
      }),
      true,
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cartId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete foreign keys
    const cartItemsTable = await queryRunner.getTable('cart_items');
    const cartsTable = await queryRunner.getTable('carts');

    if (cartItemsTable) {
      const cartIdForeignKey = cartItemsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('cartId') !== -1,
      );

      const productIdForeignKey = cartItemsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('productId') !== -1,
      );

      if (cartIdForeignKey) {
        await queryRunner.dropForeignKey('cart_items', cartIdForeignKey);
      }

      if (productIdForeignKey) {
        await queryRunner.dropForeignKey('cart_items', productIdForeignKey);
      }
    }

    if (cartsTable) {
      const userIdForeignKey = cartsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );

      if (userIdForeignKey) {
        await queryRunner.dropForeignKey('carts', userIdForeignKey);
      }
    }

    // Delete tables
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}
