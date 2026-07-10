import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
            client_id: process.env.FB_APP_ID!,
            client_secret: process.env.FB_APP_SECRET!,
            redirect_uri: "http://localhost:3000/api/Facebook-callback",
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

    // Redirect to dashboard with account ID and token
    return NextResponse.redirect(
        `http://localhost:3000/choice?act_id=${firstAccountId.replace('act_', '')}&access_token=${accessToken}`
    );
}
