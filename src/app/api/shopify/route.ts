import { NextRequest, NextResponse } from 'next/server';
import { fetchShopifyProducts, fetchShopifyOrders } from '../../../lib/api/shopifyApi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopifyUrl = searchParams.get('shopify_url');
  const shopifyToken = searchParams.get('shopify_token');
  const type = searchParams.get('type') || 'all';
  const limit = searchParams.get('limit') || '50';
  const pageInfo = searchParams.get('page_info') || undefined;

  if (!shopifyUrl || !shopifyToken) {
    return NextResponse.json({ error: 'Missing Shopify credentials' }, { status: 400 });
  }

  const config = {
    shopifyStoreUrl: shopifyUrl,
    shopifyAccessToken: shopifyToken,
  };

  try {
    if (type === 'products') {
      const result = await fetchShopifyProducts(config, limit, pageInfo);
      return NextResponse.json({ 
        products: result.products, 
        nextPageInfo: result.nextPageInfo 
      });
    }
    
    if (type === 'orders') {
      const result = await fetchShopifyOrders(config, '250', pageInfo);
      return NextResponse.json({ 
        orders: result.orders, 
        nextPageInfo: result.nextPageInfo 
      });
    }

    const [prodResult, orderResult] = await Promise.all([
      fetchShopifyProducts(config, limit, pageInfo),
      fetchShopifyOrders(config, '250'),
    ]);

    return NextResponse.json({ 
      products: prodResult.products, 
      orders: orderResult.orders,
      nextPageInfo: prodResult.nextPageInfo
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch Shopify data' }, { status: 500 });
  }
}
