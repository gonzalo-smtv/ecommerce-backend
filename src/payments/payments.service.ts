import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { ProductVariationsService } from '@app/products/products.service';
import { UsersService } from '@app/users/users.service';
import { CheckoutItemDto } from './dto/checkout.dto';
import { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';
import { PaymentData } from './types/payment.types';
import { WebhookNotificationDto } from './dto/webhook.dto';
import { OrderService } from './services/order.service';

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
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    private productsService: ProductVariationsService,
    private usersService: UsersService,
    private orderService: OrderService,
  ) {
    // Initialize MercadoPago client with the new SDK format
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.getOrThrow<string>(
        'MERCADO_PAGO_ACCESS_TOKEN',
      ),
    });
  }

  async createCheckoutPreference(
    checkoutItems: CheckoutItemDto[],
    userId: string,
  ) {
    // Validate that user exists
    await this.usersService.findById(userId);

    const items = await Promise.all(
      checkoutItems.map(this.mapCheckoutItemDtoToItemPreference.bind(this)),
    );

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );

    // Create order in pending state
    const order = await this.orderService.createOrder({
      userId,
      items: checkoutItems,
      totalAmount,
    });

    const preferenceData: PreferenceRequest = {
      items,
      back_urls: {
        success: this.configService.getOrThrow<string>(
          'MERCADO_PAGO_SUCCESS_URL',
        ),
        failure: this.configService.getOrThrow<string>(
          'MERCADO_PAGO_FAILURE_URL',
        ),
        pending: this.configService.getOrThrow<string>(
          'MERCADO_PAGO_PENDING_URL',
        ),
      },
      auto_return: 'approved',
      statement_descriptor: 'LTecDeco',
      external_reference: order.id,
      notification_url: this.configService.getOrThrow<string>(
        'MERCADO_PAGO_WEBHOOK_URL',
      ),
    };

    try {
      const preference = new Preference(this.client);
      const response = await preference.create({ body: preferenceData });
      return response;
    } catch (error: any) {
      throw new Error(
        `Failed to create Mercado Pago preference: ${error.message}`,
      );
    }
  }

  private async mapCheckoutItemDtoToItemPreference(
    item: CheckoutItemDto,
  ): Promise<PreferenceItem> {
    const product = await this.productsService.findByIdWithDetails(item.id);

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

  async handleWebhookNotification(webhookData: WebhookNotificationDto) {
    this.logger.log(
      `Received webhook notification: ${JSON.stringify(webhookData)}`,
    );

    try {
      switch (webhookData.type) {
        case 'payment':
          await this.handlePaymentNotification(webhookData.data.id);
          break;
        // Add more cases for other notification types as needed
        default:
          this.logger.warn(
            `Unhandled webhook notification type: ${webhookData.type}`,
          );
      }

      return { status: 'success' };
    } catch (error: any) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  private async handlePaymentNotification(paymentId: string | number) {
    try {
      const payment = new Payment(this.client);
      const response = await payment.get({ id: paymentId.toString() });

      if (
        !response.id ||
        !response.status ||
        !response.status_detail ||
        !response.payment_method_id
      ) {
        throw new Error(`Invalid payment response for payment ${paymentId}`);
      }

      const paymentData: PaymentData = {
        id: response.id.toString(),
        status: response.status,
        status_detail: response.status_detail,
        payment_method_id: response.payment_method_id,
        external_reference: response.external_reference,
      };

      // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
      this.logger.log(`Payment ${paymentId} paymentData: ${paymentData}`);

      // Find the order by external reference
      const order = await this.orderService.findById(
        paymentData.external_reference || '',
      );
      if (!order) {
        throw new Error(`Order not found for payment ${paymentId}`);
      }

      // Update order with payment information
      await this.orderService.updateOrderPayment(order, paymentData);

      // Handle different payment statuses
      switch (paymentData.status) {
        case 'approved':
          this.logger.log(`Payment ${paymentId} approved.`);
          // TODO: Send order confirmation email
          // TODO: Update inventory
          break;
        case 'pending':
          this.logger.log(`Payment ${paymentId} is pending.`);
          // TODO: Send payment pending notification
          break;
        case 'rejected':
          this.logger.log(`Payment ${paymentId} was rejected.`);
          // TODO: Send payment failed notification
          break;
        default:
          this.logger.warn(`Unhandled payment status: ${paymentData.status}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Error fetching payment ${paymentId}: ${error.message}`,
      );
      throw error;
    }
  }
}
