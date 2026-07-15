import { NextResponse } from 'next/server';

export async function GET() {
  // ✅ CHANGE THIS: Use your Vercel URL
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://marketing-lovat-iota-62.vercel.app'  // ← YOUR VERCEL URL
    : 'http://localhost:3000';
    
  const redirectUri = encodeURIComponent(`${baseUrl}/api/Facebook-callback`);
  const appId = process.env.FB_APP_ID;
  const scope = 'ads_management,ads_read,business_management,pages_read_engagement';

  const loginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return NextResponse.redirect(loginUrl);
}