import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceRole } from '@/lib/supabase-server';
import { ensureProfile } from '@/lib/ensure-profile';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  stripeClient = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  return stripeClient;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const interval: 'monthly' | 'annual' =
    body.interval === 'annual' ? 'annual' : 'monthly';

  const priceId =
    interval === 'annual'
      ? process.env.STRIPE_PRICE_ID_PRO_ANNUAL || process.env.STRIPE_PRICE_ID_PRO
      : process.env.STRIPE_PRICE_ID_PRO;

  if (!priceId) {
    return NextResponse.json(
      { error: 'billing not configured' },
      { status: 503 }
    );
  }

  await ensureProfile(userId);
  const admin = createServiceRole();
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: 'profile missing' }, { status: 500 });
  }

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const user = await currentUser();
    const email =
      user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? profile.email;
    const customer = await getStripe().customers.create({
      email,
      metadata: { clerk_user_id: userId },
    });
    customerId = customer.id;
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancel`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: 'stripe did not return a url' },
      { status: 500 }
    );
  }
  return NextResponse.json({ url: session.url });
}
