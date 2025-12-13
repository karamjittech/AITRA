export const PADDLE_CONFIG = {
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'pdl_sdbx_apikey_01kcbgb9119ksnqygd6k6gjj2c_r43PXqaCbmPMnNBH84ND7D_A9S',
  priceIds: {
    pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_01kcbj0yk158vrs63t7yw1fjxn',
    agency: process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID || 'pri_01kcbhy8emkcytbxds6rp7rny9',
  },
};

export const PLAN_LIMITS = {
  free: {
    tier: 'free' as const,
    websites: 1,
    keywords: 3,
    credits: 50,
    price: 0,
  },
  pro: {
    tier: 'pro' as const,
    websites: 3,
    keywords: 50,
    credits: 500,
    price: 39,
  },
  agency: {
    tier: 'agency' as const,
    websites: 15,
    keywords: 250,
    credits: 2500,
    price: 119,
  },
};
