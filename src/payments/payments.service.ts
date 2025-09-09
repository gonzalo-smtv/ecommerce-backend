import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ProductsService } from '@app/products/products.service';
import { CheckoutItemDto } from './dto/checkout.dto';
import { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';

interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
  ) {
    // Initialize MercadoPago client with the new SDK format
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.getOrThrow<string>('MERCADO_PAGO_ACCESS_TOKEN'),
    });
  }

  async createCheckoutPreference(checkoutItems: CheckoutItemDto[]) {
    const items = await Promise.all(checkoutItems.map(
      this.mapCheckoutItemDtoToItemPreference.bind(this)
    ));
    const preferenceData: PreferenceRequest = {
      items,
      back_urls: {
        success: this.configService.getOrThrow<string>('MERCADO_PAGO_SUCCESS_URL'),
        failure: this.configService.getOrThrow<string>('MERCADO_PAGO_FAILURE_URL'),
        pending: this.configService.getOrThrow<string>('MERCADO_PAGO_PENDING_URL'),
      },
      auto_return: 'approved',
      statement_descriptor: 'LTecDeco',
      external_reference: Date.now().toString(),
    };

    try {
      console.log(preferenceData);
      const preference = new Preference(this.client);
      const response = await preference.create({ body: preferenceData });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create Mercado Pago preference: ${error.message}`);
    }
  }

  private async mapCheckoutItemDtoToItemPreference(item: CheckoutItemDto) : Promise<PreferenceItem> {
    const product = await this.productsService.findById(item.id);

    if (!product) {
      throw new Error(`Product with id ${item.id} not found`);
    }

    return {
      id: item.id.toString(),
      quantity: item.quantity,
      title: product.name,
      unit_price: product.price,
      currency_id: 'ARS',
    };
  }
}