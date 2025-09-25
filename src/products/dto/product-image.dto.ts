export class ProductImageDto {
  url: string;
  path: string;
  isMain: boolean;
  sortOrder: number;
  altText?: string;
}

export class AddProductImagesDto {
  productId: string;
  isMain?: boolean;
  altText?: string;
}

export class UpdateProductImageDto {
  isMain?: boolean;
  sortOrder?: number;
  altText?: string;
}

export class DeleteProductImageDto {
  imageId: string;
}
