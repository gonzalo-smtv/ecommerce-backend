import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/checkout.dto';
import { WebhookNotificationDto } from './dto/webhook.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/mercadopago/checkout')
  @ApiOperation({ summary: 'Create a Mercado Pago checkout preference' })
  @ApiResponse({
    status: 201,
    description: 'The checkout preference has been successfully created',
  })
  async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutPreference(
      createCheckoutDto.items,
    );
  }

  @Post('/mercadopago/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Mercado Pago webhook notifications' })
  @ApiResponse({
    status: 200,
    description: 'The webhook notification has been successfully processed',
  })
  async handleWebhook(@Body() webhookData: WebhookNotificationDto) {
    return this.paymentsService.handleWebhookNotification(webhookData);
  }
}
