import {
  Controller,
  Post,
  HttpCode,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import express from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { OrderService } from '../order/order.service';

@Controller('/api/stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<express.Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException(
        'Missing webhook signature or raw body',
      );
    }
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      signature,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data
        .object as Stripe.Checkout.Session;

      console.log('Stripe session:', {
        id: session.id,
        metadata: session.metadata,
        paymentStatus: session.payment_status,
      });

      if (session.payment_status === 'paid') {
        try {
          await this.orderService.confirmStripePayment(session);
        } catch (error) {
          throw error;
        }
      }
    }
    return { received: true };
  }
}
