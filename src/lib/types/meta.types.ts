// ============================================
// META API TYPES
// ============================================

export interface MetaConfig {
  accessToken: string;
  accountId: string;
  dateRange?: {
    since?: string;
    until?: string;
    preset?: string;
  };
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  summary?: any;
}

// ============================================
// CAMPAIGN TYPES - FIXED (removed campaign_optimization_type)
// ============================================

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  effective_status: string;
  configured_status: string;
  daily_budget: number; // in cents
  lifetime_budget: number; // in cents
  budget_remaining: number;
  start_time: string;
  stop_time?: string;
  created_time: string;
  updated_time: string;
  buying_type: 'AUCTION' | 'RESERVED';
  special_ad_categories: string[];
  spend_cap?: number;
  bid_strategy?: string;
}

// ============================================
// AD SET TYPES
// ============================================

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  campaign_name?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  effective_status: string;
  daily_budget: number; // in cents
  lifetime_budget: number; // in cents
  budget_remaining: number;
  start_time: string;
  end_time?: string;
  bid_strategy: string;
  optimization_goal: string;
  billing_event: string;
  targeting: {
    geo_locations: any;
    age_min?: number;
    age_max?: number;
    genders?: string[];
    interests?: any[];
    locations?: any[];
    behaviors?: any[];
  };
  created_time: string;
  updated_time: string;
}

// ============================================
// AD TYPES
// ============================================

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  adset_name?: string;
  campaign_id: string;
  campaign_name?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  effective_status: string;
  creative: {
    id: string;
    headline: string;
    description: string;
    final_url: string;
    call_to_action?: string;
    image_url?: string;
    thumbnail_url?: string;
  };
  created_time: string;
  updated_time: string;
}

// ============================================
// INSIGHTS TYPES - COMPLETE
// ============================================

export interface MetaInsights {
  // Identity
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  
  // Reach
  impressions: number;
  reach: number;
  frequency: number;
  unique_clicks: number;
  unique_ctr: number;
  
  // Clicks
  clicks: number;
  link_clicks: number;
  ctr: number; // decimal
  inline_link_clicks: number;
  
  // Cost
  spend: number;
  cpc: number;
  cpm: number;
  cpp: number;
  cost_per_conversion: number;
  cost_per_action_type: Array<{
    action_type: string;
    value: number;
  }>;
  
  // Conversions
  conversions: number;
  conversion_rate: number;
  conversion_values: number;
  actions: Array<{
    action_type: string;
    value: number;
  }>;
  action_values: Array<{
    action_type: string;
    value: number;
  }>;
  
  // Video
  video_views: number;
  video_p100_watched_actions: number;
  video_avg_time_watched_actions: number;
  video_play_actions: number;
  video_p75_watched_actions?: number;
  video_p50_watched_actions?: number;
  video_p25_watched_actions?: number;
  
  // Engagement
  engagement: number;
  likes: number;
  shares: number;
  comments: number;
  post_engagement: number;
  
  // Quality
  quality_ranking: 'UNKNOWN' | 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE';
  conversion_rate_ranking: 'UNKNOWN' | 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE';
  
  // Dates
  date_start: string;
  date_stop: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardData {
  campaigns: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAd[];
  campaignInsights: Record<string, MetaInsights>;
  adSetInsights: Record<string, MetaInsights>;
  adInsights: Record<string, MetaInsights>;
  creatives: Record<string, any>;
  summary: {
    totalCampaigns: number;
    totalAdSets: number;
    totalAds: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgCPC: number;
    avgROAS:number;
    activeCampaigns: number;
    pausedCampaigns: number;
    totalRevenue: number;        
    averageROAS: number;  
  };
  pagination: {
    campaigns: { hasMore: boolean; after?: string };
    adSets: { hasMore: boolean; after?: string };
    ads: { hasMore: boolean; after?: string };
  };
  loading: {
    campaigns: boolean;
    adSets: boolean;
    ads: boolean;
    insights: boolean;
    creatives: boolean;
  };
  errors: {
    campaigns?: string;
    adSets?: string;
    ads?: string;
    insights?: string;
    creatives?: string;
  };
}

// ============================================
// UI TRANSFORMED TYPES
// ============================================

export interface TransformedCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';
  type: string;
  objective: string;
  clicks: number;
  impressions: number;
  cost: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionValue: number;
  budget: number;
  startDate?: string;
  endDate?: string;
  raw: MetaCampaign;
  insights: MetaInsights;
  roas: number;   
}

export interface TransformedAdSet {
  id: string;
  name: string;
  campaignName: string;
  campaignId: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';
  clicks: number;
  impressions: number;
  cost: number;
  ctr: number;
  conversions: number;
  budget: number;
    roas: number;
  targeting: string;
  optimizationGoal: string;
  raw: MetaAdSet;
  insights: MetaInsights;
}

export interface TransformedAd {
  id: string;
  name: string;
  type: string;
  adGroupName: string;
  campaignName: string;
  clicks: number;
  impressions: number;
  cost: number;
  ctr: number;
  headline: string;
  description: string;
  finalUrl: string;
  status: string;
    
  raw: MetaAd;
  insights: MetaInsights;
  creative: any;
   roas: number; 
}