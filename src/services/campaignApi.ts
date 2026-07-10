// services/metaApi.ts

// ============================================
// 1. CAMPAIGN API
// ============================================

interface CreateCampaignPayload {
  name: string;
  objective: string;
  status: string;
  buying_type: string;
  special_ad_categories: string[];
  is_adset_budget_sharing_enabled: boolean;
}

export async function createNewCampaign(
  payload: CreateCampaignPayload,
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v25.0/${cleanActId}/campaigns`;

  const body = new URLSearchParams({
    name: payload.name,
    objective: payload.objective,
    status: payload.status,
    buying_type: payload.buying_type,
    special_ad_categories: JSON.stringify(payload.special_ad_categories),
    is_adset_budget_sharing_enabled: String(payload.is_adset_budget_sharing_enabled),
    access_token: accessToken,
  });

  const res = await fetch(url, {
    method: 'POST',
    body,
  });

  const json = await res.json();
  if (json.error) {
    console.error('Full Facebook error:', json.error);
    throw new Error(json.error.error_user_msg || json.error.message);
  }
  return json;
}

// ============================================
// 2. AD SET API
// ============================================

interface CreateAdSetPayload {
  name: string;
  campaign_id: string;
  daily_budget: number;
  status: string;
  billing_event?: string;
  optimization_goal?: string;
  targeting?: Record<string, any>;
  promoted_object?: {
    page_id?: string;
    pixel_id?: string;
    custom_event_type?: string;
  };
}

export async function createNewAdSet(
  payload: CreateAdSetPayload,
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v25.0/${cleanActId}/adsets`;

  const billingEvent = payload.billing_event || 'IMPRESSIONS';
  const optimizationGoal = payload.optimization_goal || 'REACH';
  const targetingObj = payload.targeting || { geo_locations: { countries: ['US'] } };

  const body = new URLSearchParams({
    name: payload.name,
    campaign_id: payload.campaign_id,
    daily_budget: String(payload.daily_budget),
    status: payload.status,
    billing_event: billingEvent,
    optimization_goal: optimizationGoal,
    targeting: JSON.stringify(targetingObj),
    access_token: accessToken,
  });

  // Add promoted_object if provided
  if (payload.promoted_object) {
    body.append('promoted_object', JSON.stringify(payload.promoted_object));
  }

  const res = await fetch(url, {
    method: 'POST',
    body,
  });

  const json = await res.json();
  if (json.error) {
    console.error('Full Meta AdSet Error:', json.error);
    throw new Error(json.error.error_user_msg || json.error.message);
  }
  return json;
}

// ============================================
// 3. INSIGHTS API
// ============================================

// 3a. Campaign Insights
export async function getCampaignInsights(
  accessToken: string,
  actId: string,
  options?: {
    date_preset?: string;
    time_range?: { since: string; until: string };
  }
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  
  // Default fields
  const fields = [
    'campaign_id',
    'campaign_name',
    'impressions',
    'reach',
    'clicks',
    'ctr',
    'cpc',
    'cpm',
    'spend',
    'conversion_rate_ranking'
  ].join(',');

  let url = `https://graph.facebook.com/v25.0/${cleanActId}/insights?level=campaign&fields=${fields}&access_token=${accessToken}`;

  // Add date preset if provided
  if (options?.date_preset) {
    url += `&date_preset=${options.date_preset}`;
  }
  
  // Add time range if provided
  if (options?.time_range) {
    url += `&time_range=${JSON.stringify(options.time_range)}`;
  }

  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Campaign Insights Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// 3b. AdSet Insights
export async function getAdSetInsights(
  accessToken: string,
  actId: string,
  options?: {
    date_preset?: string;
    time_range?: { since: string; until: string };
    adset_ids?: string[];
  }
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  
  const fields = [
    'adset_id',
    'adset_name',
    'campaign_name',
    'reach',
    'clicks',
    'ctr',
    'cpc',
    'spend'
  ].join(',');

  let url = `https://graph.facebook.com/v25.0/${cleanActId}/insights?level=adset&fields=${fields}&access_token=${accessToken}`;

  if (options?.date_preset) {
    url += `&date_preset=${options.date_preset}`;
  }
  
  if (options?.time_range) {
    url += `&time_range=${JSON.stringify(options.time_range)}`;
  }

  if (options?.adset_ids && options.adset_ids.length > 0) {
    url += `&filtering=${JSON.stringify([{
      field: 'adset_id',
      operator: 'IN',
      value: options.adset_ids
    }])}`;
  }

  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('AdSet Insights Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// 3c. Ad Insights
export async function getAdInsights(
  accessToken: string,
  actId: string,
  options?: {
    date_preset?: string;
    time_range?: { since: string; until: string };
    ad_ids?: string[];
  }
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  
  const fields = [
    'ad_id',
    'ad_name',
    'campaign_name',
    'impressions',
    'reach',
    'clicks',
    'cpc',
    'cpm',
    'spend',
    'date_start',
    'date_stop'
  ].join(',');

  let url = `https://graph.facebook.com/v25.0/${cleanActId}/insights?level=ad&fields=${fields}&access_token=${accessToken}`;

  if (options?.date_preset) {
    url += `&date_preset=${options.date_preset}`;
  }
  
  if (options?.time_range) {
    url += `&time_range=${JSON.stringify(options.time_range)}`;
  }

  if (options?.ad_ids && options.ad_ids.length > 0) {
    url += `&filtering=${JSON.stringify([{
      field: 'ad_id',
      operator: 'IN',
      value: options.ad_ids
    }])}`;
  }

  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Ad Insights Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// ============================================
// 4. HIERARCHY API (Campaigns with AdSets and Ads)
// ============================================

export async function getCampaignHierarchy(
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  
  const fields = [
    'name',
    'status',
    'objective',
    'adsets{name,status,daily_budget,ads{name,status}}'
  ].join(',');

  const url = `https://graph.facebook.com/v22.0/${cleanActId}/campaigns?fields=${fields}&access_token=${accessToken}`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Hierarchy Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// ============================================
// 5. PAGES API (For promoted objects)
// ============================================

export async function getFacebookPages(accessToken: string) {
  const url = `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,category,access_token&access_token=${accessToken}`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Pages Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// ============================================
// 6. ACCOUNT INFO API
// ============================================

export async function getAccountInfo(
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v22.0/${cleanActId}?fields=currency,name,account_status&access_token=${accessToken}`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Account Info Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}

// ============================================
// 7. COMPLETE DATA FETCHER (Combines everything)
// ============================================

export async function fetchAllDashboardData(
  accessToken: string,
  actId: string
) {
  try {
    // Fetch all data in parallel
    const [hierarchy, campaignInsights, adsetInsights, adInsights, accountInfo, pages] = await Promise.all([
      getCampaignHierarchy(accessToken, actId),
      getCampaignInsights(accessToken, actId, { date_preset: 'last_30d' }),
      getAdSetInsights(accessToken, actId, { date_preset: 'last_30d' }),
      getAdInsights(accessToken, actId, { date_preset: 'last_30d' }),
      getAccountInfo(accessToken, actId),
      getFacebookPages(accessToken).catch(() => ({ data: [] })) // Pages might fail, but continue
    ]);

    return {
      success: true,
      data: {
        campaigns: hierarchy.data || [],
        account: accountInfo,
        insights: {
          campaign: campaignInsights.data || [],
          adset: adsetInsights.data || [],
          ad: adInsights.data || []
        },
        pages: pages.data || []
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ============================================
// 8. INSIGHTS WITH DATE RANGE
// ============================================

export async function getInsightsWithDateRange(
  accessToken: string,
  actId: string,
  level: 'campaign' | 'adset' | 'ad',
  since: string,
  until: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  
  const fields = level === 'campaign' 
    ? 'campaign_id,campaign_name,impressions,reach,clicks,ctr,cpc,cpm,spend,conversion_rate_ranking'
    : level === 'adset'
    ? 'adset_id,adset_name,campaign_name,reach,clicks,ctr,cpc,spend'
    : 'ad_id,ad_name,campaign_name,impressions,reach,clicks,cpc,cpm,spend,date_start,date_stop';

  const url = `https://graph.facebook.com/v25.0/${cleanActId}/insights?level=${level}&fields=${fields}&time_range=${JSON.stringify({ since, until })}&access_token=${accessToken}`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  if (json.error) {
    console.error('Insights Error:', json.error);
    throw new Error(json.error.message);
  }
  
  return json;
}