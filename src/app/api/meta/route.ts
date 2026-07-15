// ============================================
// META API ROUTE - Next.js App Router
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchCompleteDashboard } from '../../../lib/api/metaApi';
import type { MetaConfig } from '../../../lib/types/meta.types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');
    const accountId = searchParams.get('account_id');
    const datePreset = searchParams.get('date_preset') || 'last_30d';
    const since = searchParams.get('since') || undefined;
    const until = searchParams.get('until') || undefined;
    const pageSize = parseInt(searchParams.get('page_size') || '100');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access_token parameter' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing account_id parameter' },
        { status: 400 }
      );
    }

    const config: MetaConfig = {
      accessToken,
      accountId,
      dateRange: {
        preset: datePreset,
        since,
        until,
      },
      pageSize,
    };

    const dashboardData = await fetchCompleteDashboard(config);

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error: any) {
    console.error('Meta API Route Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Meta dashboard data',
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: error.code === 4 || error.code === 17 ? 429 : 500 }
    );
  }
}

// Optional: POST method for loading more data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      accessToken, 
      accountId, 
      type, 
      after, 
      datePreset = 'last_30d',
      pageSize = 100 
    } = body;

    if (!accessToken || !accountId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Import the load more functions dynamically to avoid circular imports
    const { loadMoreCampaigns, loadMoreAdSets, loadMoreAds } = await import('../../../lib/api/metaApi');

    const config: MetaConfig = {
      accessToken,
      accountId,
      dateRange: { preset: datePreset },
      pageSize,
    };

    let result;
    switch (type) {
      case 'campaigns':
        result = await loadMoreCampaigns(config, after, pageSize);
        break;
      case 'adSets':
        result = await loadMoreAdSets(config, after, pageSize);
        break;
      case 'ads':
        result = await loadMoreAds(config, after, pageSize);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be campaigns, adSets, or ads' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Meta API Load More Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to load more data',
      },
      { status: 500 }
    );
  }
}