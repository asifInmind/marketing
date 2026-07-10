// src/app/api/facebook-login/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = encodeURIComponent('http://localhost:3000/api/Facebook-callback'); // change this if deployed
    const appId = process.env.FB_APP_ID;
    const scope = 'ads_management,ads_read,business_management,pages_read_engagement';

    const loginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    return NextResponse.redirect(loginUrl);
}
