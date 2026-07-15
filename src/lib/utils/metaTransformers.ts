// ============================================
// META DATA TRANSFORMERS
// ============================================

import {
  META_STATUS_MAP,
  OBJECTIVE_MAP,
  OBJECTIVE_TYPE_MAP,
  DEFAULT_VALUES,
} from './constants';
import type {
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  TransformedCampaign,
  TransformedAdSet,
  TransformedAd,
} from '../types/meta.types';

// ============================================
// SAFE VALUE GETTERS
// ============================================

export function safeNumber(value: any, fallback: number = DEFAULT_VALUES.NUMBER): number {
  if (value === undefined || value === null || value === '' || isNaN(value)) {
    return fallback;
  }
  return Number(value);
}

export function safeString(value: any, fallback: string = DEFAULT_VALUES.TEXT): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
}

export function safeCurrency(value: number): string {
  const num = safeNumber(value);
  if (num === 0) return '$0.00';
  return `$${num.toFixed(2)}`;
}

export function safePercentage(value: number): string {
  const num = safeNumber(value);
  if (num === 0) return '0%';
  return `${num.toFixed(2)}%`;
}

// ============================================
// ROAS CALCULATOR
// ============================================

export function calculateROAS(revenue: number, spend: number): number {
  if (!spend || spend === 0) return 0;
  return revenue / spend;
}

// ============================================
// STATUS TRANSFORMERS
// ============================================

export function transformStatus(metaStatus: string): 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN' {
  const mapped = META_STATUS_MAP[metaStatus as keyof typeof META_STATUS_MAP];
  return (mapped as any) || 'UNKNOWN';
}

// ============================================
// OBJECTIVE TRANSFORMERS
// ============================================

export function transformObjective(objective: string): string {
  const mapped = OBJECTIVE_MAP[objective as keyof typeof OBJECTIVE_MAP];
  return mapped || DEFAULT_VALUES.TEXT;
}

export function transformObjectiveType(objective: string): string {
  const mapped = OBJECTIVE_TYPE_MAP[objective as keyof typeof OBJECTIVE_TYPE_MAP];
  return mapped || 'UNKNOWN';
}

// ============================================
// INSIGHTS TRANSFORMERS
// ============================================

export function transformInsights(insights: MetaInsights | undefined): MetaInsights {
  if (!insights) {
    return {
      impressions: 0,
      reach: 0,
      frequency: 0,
      unique_clicks: 0,
      unique_ctr: 0,
      clicks: 0,
      link_clicks: 0,
      ctr: 0,
      inline_link_clicks: 0,
      spend: 0,
      cpc: 0,
      cpm: 0,
      cpp: 0,
      cost_per_conversion: 0,
      cost_per_action_type: [],
      conversions: 0,
      conversion_rate: 0,
      conversion_values: 0,
      actions: [],
      action_values: [],
      video_views: 0,
      video_p100_watched_actions: 0,
      video_avg_time_watched_actions: 0,
      video_play_actions: 0,
      engagement: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      post_engagement: 0,
      quality_ranking: 'UNKNOWN',
      conversion_rate_ranking: 'UNKNOWN',
      date_start: '',
      date_stop: '',
    };
  }

  return {
    impressions: safeNumber(insights.impressions),
    reach: safeNumber(insights.reach),
    frequency: safeNumber(insights.frequency),
    unique_clicks: safeNumber(insights.unique_clicks),
    unique_ctr: safeNumber(insights.unique_ctr),
    clicks: safeNumber(insights.clicks),
    link_clicks: safeNumber(insights.link_clicks),
    ctr: safeNumber(insights.ctr),
    inline_link_clicks: safeNumber(insights.inline_link_clicks),
    spend: safeNumber(insights.spend),
    cpc: safeNumber(insights.cpc),
    cpm: safeNumber(insights.cpm),
    cpp: safeNumber(insights.cpp),
    cost_per_conversion: safeNumber(insights.cost_per_conversion),
    cost_per_action_type: insights.cost_per_action_type || [],
    conversions: safeNumber(insights.conversions),
    conversion_rate: safeNumber(insights.conversion_rate),
    conversion_values: safeNumber(insights.conversion_values),
    actions: insights.actions || [],
    action_values: insights.action_values || [],
    video_views: safeNumber(insights.video_views),
    video_p100_watched_actions: safeNumber(insights.video_p100_watched_actions),
    video_avg_time_watched_actions: safeNumber(insights.video_avg_time_watched_actions),
    video_play_actions: safeNumber(insights.video_play_actions),
    engagement: safeNumber(insights.engagement),
    likes: safeNumber(insights.likes),
    shares: safeNumber(insights.shares),
    comments: safeNumber(insights.comments),
    post_engagement: safeNumber(insights.post_engagement),
    quality_ranking: insights.quality_ranking || 'UNKNOWN',
    conversion_rate_ranking: insights.conversion_rate_ranking || 'UNKNOWN',
    date_start: safeString(insights.date_start),
    date_stop: safeString(insights.date_stop),
  };
}

// ============================================
// CAMPAIGN TRANSFORMER
// ============================================

export function transformCampaign(
  campaign: MetaCampaign,
  insights?: MetaInsights
): TransformedCampaign {
  const transformedInsights = transformInsights(insights);
  
  const cost = transformedInsights.spend;
  const revenue = transformedInsights.conversion_values;
  const roas = calculateROAS(revenue, cost);
  
  return {
    id: campaign.id,
    name: safeString(campaign.name),
    status: transformStatus(campaign.status),
    type: transformObjectiveType(campaign.objective),
    objective: transformObjective(campaign.objective),
    clicks: transformedInsights.clicks,
    impressions: transformedInsights.impressions,
    cost: cost,
    ctr: transformedInsights.ctr * 100,
    cpc: transformedInsights.cpc,
    conversions: transformedInsights.conversions,
    conversionValue: revenue,
    budget: campaign.daily_budget ? campaign.daily_budget / 100 : 0,
    startDate: campaign.start_time,
    endDate: campaign.stop_time,
    roas: roas, // ✅ ADDED
    raw: campaign,
    insights: transformedInsights,
  };
}

// ============================================
// AD SET TRANSFORMER
// ============================================

export function transformAdSet(
  adSet: MetaAdSet,
  insights?: MetaInsights
): TransformedAdSet {
  const transformedInsights = transformInsights(insights);
  
  const cost = transformedInsights.spend;
  const revenue = transformedInsights.conversion_values;
  const roas = calculateROAS(revenue, cost);
  
  // Format targeting summary
  let targetingSummary = 'All';
  if (adSet.targeting) {
    const parts = [];
    if (adSet.targeting.age_min || adSet.targeting.age_max) {
      parts.push(`Age ${adSet.targeting.age_min || 13}-${adSet.targeting.age_max || 65}+`);
    }
    if (adSet.targeting.genders && adSet.targeting.genders.length > 0) {
      parts.push(adSet.targeting.genders.join(', '));
    }
    if (adSet.targeting.geo_locations?.countries) {
      parts.push(adSet.targeting.geo_locations.countries.join(', '));
    }
    targetingSummary = parts.length > 0 ? parts.join(' • ') : 'All';
  }
  console.log('🔄 Transforming ad set:', {
    id: adSet.id,
    name: adSet.name,
    campaign_id: adSet.campaign_id,
    campaign_name: adSet.campaign_name, // ✅ Check if this passes through
  });
  
  return {
    id: adSet.id,
    name: safeString(adSet.name),
    campaignName: safeString(adSet.campaign_name || 'N/A'),
    campaignId: adSet.campaign_id,
    status: transformStatus(adSet.status),
    clicks: transformedInsights.clicks,
    impressions: transformedInsights.impressions,
    cost: cost,
    ctr: transformedInsights.ctr * 100,
    conversions: transformedInsights.conversions,
    budget: adSet.daily_budget ? adSet.daily_budget / 100 : 0,
    targeting: targetingSummary,
    optimizationGoal: safeString(adSet.optimization_goal, 'N/A'),
    roas: roas, // ✅ ADDED
    raw: adSet,
    insights: transformedInsights,
  };
}

// ============================================
// AD TRANSFORMER
// ============================================

export function transformAd(
  ad: MetaAd,
  insights?: MetaInsights,
  creative?: any
): TransformedAd {
  const transformedInsights = transformInsights(insights);
  
  const cost = transformedInsights.spend;
  const revenue = transformedInsights.conversion_values;
  const roas = calculateROAS(revenue, cost);
  
  // Determine ad type from creative or objective
  let adType = 'DISPLAY';
  if (creative?.call_to_action) {
    if (creative.call_to_action.includes('LEARN')) adType = 'VIDEO';
    else if (creative.call_to_action.includes('SHOP')) adType = 'SHOPPING';
    else if (creative.call_to_action.includes('SIGN')) adType = 'LEAD_GEN';
  }
  
  return {
    id: ad.id,
    name: safeString(ad.name),
    type: adType,
    adGroupName: safeString(ad.adset_name || 'N/A'),
    campaignName: safeString(ad.campaign_name || 'N/A'),
    clicks: transformedInsights.clicks,
    impressions: transformedInsights.impressions,
    cost: cost,
    ctr: transformedInsights.ctr * 100,
    headline: creative?.headline || DEFAULT_VALUES.TEXT,
    description: creative?.description || DEFAULT_VALUES.TEXT,
    finalUrl: creative?.final_url || DEFAULT_VALUES.URL,
    status: transformStatus(ad.status),
    roas: roas, // ✅ ADDED
    raw: ad,
    insights: transformedInsights,
    creative: creative || null,
  };
}

// ============================================
// BATCH TRANSFORMERS
// ============================================

export function transformCampaigns(
  campaigns: MetaCampaign[],
  insightsMap: Record<string, MetaInsights>
): TransformedCampaign[] {
  if (!campaigns || campaigns.length === 0) {
    return [];
  }
  
  return campaigns.map(campaign => 
    transformCampaign(campaign, insightsMap?.[campaign.id])
  );
}

export function transformAdSets(
  adSets: MetaAdSet[],
  insightsMap: Record<string, MetaInsights>
): TransformedAdSet[] {
  if (!adSets || adSets.length === 0) {
    return [];
  }
  
  return adSets.map(adSet => 
    transformAdSet(adSet, insightsMap?.[adSet.id])
  );
}

export function transformAds(
  ads: MetaAd[],
  insightsMap: Record<string, MetaInsights>,
  creativesMap: Record<string, any>
): TransformedAd[] {
  if (!ads || ads.length === 0) {
    return [];
  }
  
  return ads.map(ad => 
    transformAd(ad, insightsMap?.[ad.id], creativesMap?.[ad.id])
  );
}