import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // ✅ CHANGE THIS: Use your Vercel URL
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://marketing-lovat-iota-62.vercel.app'  // ← YOUR VERCEL URL
        : 'http://localhost:3000';
    
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

    // Fetch user's ad accounts
    const adAccountsRes = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}`
    );
    const adAccountsData = await adAccountsRes.json();

    const firstAccountId = adAccountsData?.data?.[0]?.id;

    if (!firstAccountId) {
        return NextResponse.json({ error: "No ad accounts found" }, { status: 404 });
    }

    // ✅ CHANGE THIS: Redirect to your Vercel URL
    return NextResponse.redirect(
        `${baseUrl}/choice?act_id=${firstAccountId.replace('act_', '')}&access_token=${accessToken}`
    );
}