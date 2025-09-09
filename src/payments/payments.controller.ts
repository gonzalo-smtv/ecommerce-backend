import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/checkout.dto';

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
    return this.paymentsService.createCheckoutPreference(createCheckoutDto.items);
  }
} 