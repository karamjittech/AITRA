"use client";

import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { PADDLE_CONFIG } from '@/lib/paddle-config';

interface CheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  tier: 'pro' | 'agency';
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        const paddleInstance = await initializePaddle({
          environment: PADDLE_CONFIG.environment,
          token: PADDLE_CONFIG.clientToken,
        });

        if (paddleInstance) {
          setPaddle(paddleInstance);
          setIsReady(true);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Paddle initialization failed:', err);
      }
    };

    initPaddle();
  }, []);

  const openCheckout = async (options: CheckoutOptions) => {
    if (!paddle || !isReady) {
      throw new Error('Paddle is not ready');
    }

    return new Promise((resolve, reject) => {
      try {
        paddle.Checkout.open({
          items: [{ priceId: options.priceId, quantity: 1 }],
          customer: {
            email: options.userEmail,
          },
          customData: {
            userId: options.userId,
            tier: options.tier,
          },
          settings: {
            successUrl: `${window.location.origin}/settings/billing?success=true`,
            theme: 'light',
          },
        });

        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  };

  const openManageSubscription = () => {
    if (!paddle || !isReady) {
      throw new Error('Paddle is not ready');
    }

    const paddleManageUrl = PADDLE_CONFIG.environment === 'sandbox'
      ? 'https://sandbox-subscription-management.paddle.com'
      : 'https://subscription-management.paddle.com';

    window.open(paddleManageUrl, '_blank');
  };

  return {
    paddle,
    isReady,
    error,
    openCheckout,
    openManageSubscription,
  };
}
