import { NextRequest, NextResponse } from 'next/server';
import { SHOPIFY_CLIENT_ID, SHOPIFY_SCOPES } from '../../../../lib/utils/shopifyConstants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const cleanShop = shop.replace(/^(https?:\/\/)?/, '').trim();
  const state = searchParams.get('state') || '';
  
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUri = `${baseUrl}/api/shopify/callback`;

  const scopes = SHOPIFY_SCOPES.join(',');
  
  const authorizeUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(authorizeUrl);
}
