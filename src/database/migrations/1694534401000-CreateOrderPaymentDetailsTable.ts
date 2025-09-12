import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderPaymentDetailTable1694534401000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the order_payment_details table
    await queryRunner.createTable(
      new Table({
        name: 'order_payment_details',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'method',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'statusDetail',
            type: 'varchar',
          },
          {
            name: 'transactionId',
            type: 'varchar',
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
      'order_payment_details',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key
    const table = await queryRunner.getTable('order_payment_details');
    if (!table) {
      throw new Error('Table "order_payment_details" not found');
    }

    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('orderId') !== -1);
    if (!foreignKey) {
      throw new Error('Foreign key on "orderId" not found');
    }

    await queryRunner.dropForeignKey('order_payment_details', foreignKey);

    // Drop the order_payment_details table
    await queryRunner.dropTable('order_payment_details');
  }
} 