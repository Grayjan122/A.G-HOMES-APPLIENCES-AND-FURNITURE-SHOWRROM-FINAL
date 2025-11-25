import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    '[checkout] Missing STRIPE_SECRET_KEY. Configure environment variables to enable online payments.'
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  : null;

const truncate = (value, maxLength) => {
  if (!value) {
    return '';
  }

  const str = String(value);
  if (str.length <= maxLength) {
    return str;
  }

  const safeLength = Math.max(1, maxLength - 3);
  return str.slice(0, safeLength) + '...';
};

export async function POST(req) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Online payments are not available. Please contact support.' },
      { status: 503 }
    );
  }

  try {
    const { cartItems, customer, order_id, order_number, delivery_details } = await req.json();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Add items before checking out.' },
        { status: 400 }
      );
    }

    const lineItems = cartItems
      .map((item) => {
        const price = Number.parseFloat(item?.price);
        if (!Number.isFinite(price) || price <= 0) {
          return null;
        }

        const unitAmount = Math.round(price * 100);
        if (unitAmount <= 0) {
          return null;
        }

        const quantity = Math.max(1, Number.parseInt(item?.quantity ?? 1, 10) || 1);
        const displayName =
          (item?.description && String(item.description).trim()) ||
          (item?.product_name && String(item.product_name).trim()) ||
          'Product';

        const metadata = {};

        if (item?.product_id) {
          metadata.productId = truncate(item.product_id, 50);
        }

        if (item?.isCustom) {
          metadata.isCustom = 'true';
        }

        if (item?.modifications) {
          metadata.modifications = truncate(item.modifications, 120);
        }

        return {
          price_data: {
            currency: 'php',
            unit_amount: unitAmount,
            product_data: {
              name: truncate(displayName, 125),
              metadata,
            },
          },
          quantity,
        };
      })
      .filter(Boolean);

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'We could not find any payable items in your cart.' },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.STRIPE_RETURN_URL ||
      'http://localhost:3000';

    const successUrl = `${origin.replace(/\/$/, '')}/shop/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin.replace(/\/$/, '')}/shop/payment-cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'gcash'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email:
        customer?.email && String(customer.email).includes('@')
          ? String(customer.email)
          : undefined,
      metadata: {
        customerId: customer?.id ? String(customer.id) : 'guest',
        orderId: order_id ? String(order_id) : '',
        orderNumber: order_number || '',
        deliveryAddress: delivery_details?.delivery_address ? truncate(delivery_details.delivery_address, 200) : '',
        deliveryContactName: delivery_details?.delivery_contact_name ? truncate(delivery_details.delivery_contact_name, 100) : '',
        deliveryContactPhone: delivery_details?.delivery_contact_phone ? truncate(delivery_details.delivery_contact_phone, 20) : '',
        deliveryNotes: delivery_details?.delivery_notes ? truncate(delivery_details.delivery_notes, 200) : '',
      },
      shipping_address_collection: { allowed_countries: ['PH'] },
      billing_address_collection: 'required',
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('[checkout] Failed to create Stripe Checkout session:', error);
    return NextResponse.json(
      {
        error:
          'We were unable to start the payment session. Please try again or contact support if the issue persists.',
      },
      { status: 500 }
    );
  }
}

