import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceRole } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[stripe webhook] signature verify failed:', err.message);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  const db = createServiceRole();

  // Handle the key events — flesh out in Session 11.
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const plan =
        sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free';
      await db
        .from('profiles')
        .update({
          plan,
          stripe_subscription_id: sub.id,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer as string);
      break;
    }
    default:
      // ignore
      break;
  }

  return NextResponse.json({ received: true });
}
