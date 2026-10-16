import { Module } from '@nestjs/common';
import { StripeModule } from './stripe.module';
import { OrderModule } from '../order/order.module';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [OrderModule, StripeModule],
  controllers: [StripeWebhookController],
})
export class StripeWebhookModule {}
