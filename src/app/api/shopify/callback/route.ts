import { NextRequest, NextResponse } from 'next/server';
import { SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET } from '../../../../lib/utils/shopifyConstants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing shop or code parameters' }, { status: 400 });
  }

  try {
    const cleanShop = shop.replace(/^(https?:\/\/)?/, '').trim();
    
    // Exchange OAuth code for Shopify access token
    const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: `Shopify token exchange failed: ${errorText}` }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const shopifyToken = tokenData.access_token;

    if (!shopifyToken) {
      return NextResponse.json({ error: 'Failed to retrieve Shopify access token' }, { status: 500 });
    }

    // Decode state parameter (contains Meta credentials)
    let actId = '';
    let fbToken = '';
    if (state) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(state));
        actId = decodedState.actId || '';
        fbToken = decodedState.fbToken || '';
      } catch (e) {
        console.error('Failed to parse state parameter', e);
      }
    }

    // Redirect user back to the respective Dashboard route
    if (actId && fbToken) {
      return NextResponse.redirect(
        `${baseUrl}/choice/${actId}?access_token=${fbToken}&shopify_token=${shopifyToken}&shopify_url=${cleanShop}`
      );
    }

    // Fallback: Redirect to main choice page
    return NextResponse.redirect(`${baseUrl}/choice?shopify_token=${shopifyToken}&shopify_url=${cleanShop}`);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
