export const SHOPIFY_API_VERSION = '2026-01';

export const SHOPIFY_SCOPES = [
  'read_products',
  'read_orders',
  'read_inventory',
  'read_customers',
  'read_draft_orders',
  'read_reports',
  'read_marketing_events'
];

export const SHOPIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || '';
export const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || '';

