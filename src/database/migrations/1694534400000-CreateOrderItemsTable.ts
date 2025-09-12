import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderItemsTable1694534400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the new order_items table
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'orderId',
            type: 'uuid',
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
      true
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First drop the foreign key
    const table = await queryRunner.getTable('order_items');
    if (!table) {
      throw new Error('Table "order_items" not found');
    }

    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('orderId') !== -1);
    if (!foreignKey) {
      throw new Error('Foreign key on "orderId" not found');
    }

    await queryRunner.dropForeignKey('order_items', foreignKey);

    // Drop the order_items table
    await queryRunner.dropTable('order_items');
  }
} 