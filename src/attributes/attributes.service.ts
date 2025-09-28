import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import {
  CreateAttributeDto,
  CreateAttributeValueDto,
} from './dto/create-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private attributeValueRepository: Repository<AttributeValue>,
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
  ) {}

  /**
   * Create a new attribute type
   */
  async createAttribute(
    createAttributeDto: CreateAttributeDto,
  ): Promise<Attribute> {
    const existingAttribute = await this.attributeRepository.findOne({
      where: { name: createAttributeDto.name },
    });

    if (existingAttribute) {
      throw new BadRequestException(
        `Attribute with name "${createAttributeDto.name}" already exists`,
      );
    }

    const attribute = this.attributeRepository.create(createAttributeDto);
    return this.attributeRepository.save(attribute);
  }

  /**
   * Get all active attributes
   */
  async findAllAttributes(): Promise<Attribute[]> {
    return this.attributeRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get attribute by ID
   */
  async findAttributeById(id: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    return attribute;
  }

  /**
   * Create a new attribute value
   */
  async createAttributeValue(
    attributeId: string,
    createAttributeValueDto: CreateAttributeValueDto,
  ): Promise<AttributeValue> {
    // Verify attribute exists
    await this.findAttributeById(attributeId);

    const existingValue = await this.attributeValueRepository.findOne({
      where: {
        attribute_id: attributeId,
        value: createAttributeValueDto.value,
      },
    });

    if (existingValue) {
      throw new BadRequestException(
        `Attribute value "${createAttributeValueDto.value}" already exists for this attribute`,
      );
    }

    const attributeValue = this.attributeValueRepository.create({
      ...createAttributeValueDto,
      attribute_id: attributeId,
    });

    return this.attributeValueRepository.save(attributeValue);
  }

  /**
   * Get all values for an attribute
   */
  async getAttributeValues(attributeId: string): Promise<AttributeValue[]> {
    // Verify attribute exists
    await this.findAttributeById(attributeId);

    return this.attributeValueRepository.find({
      where: { attribute_id: attributeId, is_active: true },
      order: { sort_order: 'ASC', value: 'ASC' },
    });
  }

  /**
   * Assign attribute value to product
   */
  async assignAttributeToProduct(
    productId: string,
    attributeValueId: string,
  ): Promise<ProductAttribute> {
    // Verify attribute value exists
    const attributeValue = await this.attributeValueRepository.findOne({
      where: { id: attributeValueId },
    });

    if (!attributeValue) {
      throw new NotFoundException(
        `Attribute value with ID "${attributeValueId}" not found`,
      );
    }

    const existingAssignment = await this.productAttributeRepository.findOne({
      where: { product_id: productId, attribute_value_id: attributeValueId },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        'Attribute value already assigned to this product',
      );
    }

    const productAttribute = this.productAttributeRepository.create({
      product_id: productId,
      attribute_value_id: attributeValueId,
    });

    return this.productAttributeRepository.save(productAttribute);
  }

  /**
   * Get product attributes
   */
  async getProductAttributes(productId: string): Promise<AttributeValue[]> {
    const productAttributes = await this.productAttributeRepository.find({
      where: { product_id: productId },
    });

    // Get attribute values with their attribute information
    const attributeValueIds = productAttributes.map(
      (pa) => pa.attribute_value_id,
    );
    return this.attributeValueRepository.find({
      where: { id: In(attributeValueIds) },
      order: { value: 'ASC' },
    });
  }

  /**
   * Remove attribute from product
   */
  async removeAttributeFromProduct(
    productId: string,
    attributeValueId: string,
  ): Promise<void> {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: { product_id: productId, attribute_value_id: attributeValueId },
    });

    if (!productAttribute) {
      throw new NotFoundException('Attribute assignment not found');
    }

    await this.productAttributeRepository.remove(productAttribute);
  }

  /**
   * Get attributes by type
   */
  async getAttributesByType(type: string): Promise<Attribute[]> {
    return this.attributeRepository.find({
      where: { type, is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get color attributes with hex values
   */
  async getColorAttributes(): Promise<AttributeValue[]> {
    return this.attributeValueRepository.find({
      where: {
        hex_color: Not(IsNull()),
        is_active: true,
      },
      order: { sort_order: 'ASC', value: 'ASC' },
    });
  }
}
