import { SHOPIFY_API_VERSION } from '../utils/shopifyConstants';
import type { ShopifyProduct, ShopifyOrder, ShopifyCredentials } from '../types/shopify.types';

interface ShopifyApiResponse<T> {
  body: T;
  nextPageInfo: string | null;
}

async function callShopifyApi<T>(
  endpoint: string,
  config: ShopifyCredentials,
  params: Record<string, string> = {}
): Promise<ShopifyApiResponse<T>> {
  const cleanUrl = config.shopifyStoreUrl.replace(/^(https?:\/\/)?/, '').trim();
  const urlParams = new URLSearchParams(params).toString();
  const url = `https://${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}${urlParams ? `?${urlParams}` : ''}`;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': config.shopifyAccessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const sleepTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        console.warn(`[Shopify API] Rate limited. Retrying in ${sleepTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
        retries--;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error (${response.status}): ${errorText}`);
      }

      const linkHeader = response.headers.get('Link');
      let nextPageInfo: string | null = null;
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
        if (nextLink) {
          const match = nextLink.match(/page_info=([a-zA-Z0-9-_%]+)/);
          if (match && match[1]) {
            nextPageInfo = decodeURIComponent(match[1]);
          }
        }
      }

      const body = await response.json() as T;
      return { body, nextPageInfo };
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error('Failed to fetch from Shopify after retries.');
}

export async function fetchShopifyProducts(
  config: ShopifyCredentials,
  limit = '50',
  pageInfo?: string
): Promise<{ products: ShopifyProduct[]; nextPageInfo: string | null }> {
  const params: Record<string, string> = { limit };
  if (pageInfo) {
    params.page_info = pageInfo;
  }

  const result = await callShopifyApi<{ products: ShopifyProduct[] }>(
    'products.json',
    config,
    params
  );
  return {
    products: result.body.products || [],
    nextPageInfo: result.nextPageInfo,
  };
}

export async function fetchShopifyOrders(
  config: ShopifyCredentials,
  limit = '250',
  pageInfo?: string
): Promise<{ orders: ShopifyOrder[]; nextPageInfo: string | null }> {
  const params: Record<string, string> = { limit, status: 'any' };
  if (pageInfo) {
    params.page_info = pageInfo;
  }

  const result = await callShopifyApi<{ orders: ShopifyOrder[] }>(
    'orders.json',
    config,
    params
  );
  return {
    orders: result.body.orders || [],
    nextPageInfo: result.nextPageInfo,
  };
}
