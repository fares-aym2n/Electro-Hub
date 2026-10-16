import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>(
      'STRIPE_SECRET_KEY',
    );
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!secretKey) {
      throw new Error('Stripe key is undefined');
    }
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is undefined');
    }
    this.stripe = new Stripe(secretKey);
    this.webhookSecret = webhookSecret;
  }

  public async createChckoutSession(params: {
    orderId: number;
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      image: string;
    }[];
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: params.items.map((item) => ({
        price_data: {
          currency: 'egp',
          product_data: {
            name: item.productName,
            images: [item.image],
          },

          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: String(params.orderId),
      },
    });
    return session;
  }
  public constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new BadRequestException(
        'Invalid Stripe webhook signature',
      );
    }
  }
}
