import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const redirectUri = `${baseUrl}/api/Facebook-callback`;

    const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
            client_id: process.env.FB_APP_ID!,
            client_secret: process.env.FB_APP_SECRET!,
            redirect_uri: redirectUri,  // ✅ MATCHES Facebook settings
            code,
        })
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
        return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    // Exchange short-lived token (2 hours) for a long-lived token (60 days)
    let finalToken = accessToken;
    try {
        const longLivedTokenRes = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?` +
            new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: process.env.FB_APP_ID!,
                client_secret: process.env.FB_APP_SECRET!,
                fb_exchange_token: accessToken,
            })
        );
        const longLivedTokenData = await longLivedTokenRes.json();
        if (longLivedTokenData.access_token) {
            finalToken = longLivedTokenData.access_token;
        }
    } catch (err) {
        console.error('Failed to exchange for long-lived Meta token, using short-lived fallback:', err);
    }

    // Fetch user's ad accounts
    const adAccountsRes = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${finalToken}`
    );
    const adAccountsData = await adAccountsRes.json();

    const firstAccountId = adAccountsData?.data?.[0]?.id;

    if (!firstAccountId) {
        return NextResponse.json({ error: "No ad accounts found" }, { status: 404 });
    }

    // ✅ CHANGE THIS: Redirect to your Vercel URL
    return NextResponse.redirect(
        `${baseUrl}/choice?act_id=${firstAccountId.replace('act_', '')}&access_token=${finalToken}`
    );
}