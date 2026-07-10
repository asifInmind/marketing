// adCreationRules.ts

export type CampaignObjective =
  | 'BRAND_AWARENESS'
  | 'REACH'
  | 'POST_ENGAGEMENT'
  | 'LEAD_GENERATION'
  | 'APP_INSTALLS'
  | 'OUTCOME_SALES'
  | 'LINK_CLICKS'
  | 'VIDEO_VIEWS'
  | 'MESSAGES'
  | 'CONVERSIONS';

// --- Campaign Rules ---
export interface CampaignRules {
  allowed_buying_types: ('AUCTION' | 'RESERVED')[];
  requires_special_ad_category?: boolean;
}

export const campaignRules: Record<CampaignObjective, CampaignRules> = {
  BRAND_AWARENESS: {
    allowed_buying_types: ['AUCTION', 'RESERVED'],
  },
  REACH: {
    allowed_buying_types: ['AUCTION'],
  },
  POST_ENGAGEMENT: {
    allowed_buying_types: ['AUCTION', 'RESERVED'],
  },
  LEAD_GENERATION: {
    allowed_buying_types: ['AUCTION'],
  },
  APP_INSTALLS: {
    allowed_buying_types: ['AUCTION'],
  },
  OUTCOME_SALES: {
    allowed_buying_types: ['AUCTION'],
  },
  LINK_CLICKS: {
    allowed_buying_types: ['AUCTION'],
  },
  VIDEO_VIEWS: {
    allowed_buying_types: ['AUCTION'],
  },
  MESSAGES: {
    allowed_buying_types: ['AUCTION'],
  },
  CONVERSIONS: {
    allowed_buying_types: ['AUCTION'],
  },
};

// --- Ad Set Rules ---
export interface AdSetRules {
    allowed_optimization_goals: string[];
    requires_pixel?: boolean;
    requires_app_id?: boolean;
    requires_form_id?: boolean;
    requires_url?: boolean;
    requires_whatsapp_number?: boolean;
    allowed_placements: string[];
    allowed_billing_events: ('IMPRESSIONS' | 'CLICKS')[];
}

export const adSetRules: Record<CampaignObjective, AdSetRules> = {
  BRAND_AWARENESS: {
    allowed_optimization_goals: ['REACH', 'IMPRESSIONS'],
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['IMPRESSIONS'],
  },
  REACH: {
    allowed_optimization_goals: ['REACH', 'IMPRESSIONS'],
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['IMPRESSIONS'],
  },
  POST_ENGAGEMENT: {
    allowed_optimization_goals: ['POST_ENGAGEMENT'],
    allowed_placements: ['facebook', 'instagram'],
    allowed_billing_events: ['IMPRESSIONS'],
  },
  LEAD_GENERATION: {
    allowed_optimization_goals: ['LEAD_GENERATION'],
    requires_form_id: true,
    allowed_placements: ['facebook', 'instagram'],
    allowed_billing_events: ['IMPRESSIONS'],
  },
  APP_INSTALLS: {
    allowed_optimization_goals: ['APP_INSTALLS'],
    requires_app_id: true,
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['CLICKS'],
  },
  OUTCOME_SALES: {
    allowed_optimization_goals: ['CONVERSIONS'],
    requires_pixel: true,
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['CLICKS'],
  },
  LINK_CLICKS: {
    allowed_optimization_goals: ['LINK_CLICKS'],
    requires_url: true,
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['CLICKS'],
  },
  VIDEO_VIEWS: {
    allowed_optimization_goals: ['THRUPLAY', '2_SECOND_CONTINUOUS_VIDEO_VIEW'],
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['IMPRESSIONS'],
  },
  MESSAGES: {
    allowed_optimization_goals: ['MESSAGES'],
    requires_whatsapp_number: true,
    allowed_placements: ['messenger', 'instagram', 'whatsapp'],
    allowed_billing_events: ['CLICKS'],
  },
  CONVERSIONS: {
    allowed_optimization_goals: ['CONVERSIONS'],
    requires_pixel: true,
    allowed_placements: ['facebook', 'instagram', 'audience_network'],
    allowed_billing_events: ['CLICKS'],
  },
};

// --- Ad Creative Rules ---
export interface AdCreativeRules {
  allowed_formats: ('image' | 'video' | 'carousel' | 'instant_form')[];
  allowed_ctas: string[];
  requires_url?: boolean;
  requires_form_id?: boolean;
  requires_asset_feed_spec?: boolean;
}

export const adCreativeRules: Record<CampaignObjective, AdCreativeRules> = {
  BRAND_AWARENESS: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['LEARN_MORE', 'NO_BUTTON'],
  },
  REACH: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['LEARN_MORE', 'NO_BUTTON'],
  },
  POST_ENGAGEMENT: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['LIKE_PAGE', 'NO_BUTTON'],
  },
  LEAD_GENERATION: {
    allowed_formats: ['image', 'video', 'instant_form'],
    allowed_ctas: ['SIGN_UP', 'GET_QUOTE', 'APPLY_NOW'],
    requires_form_id: true,
  },
  APP_INSTALLS: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['INSTALL_NOW', 'USE_APP'],
  },
  OUTCOME_SALES: {
    allowed_formats: ['image', 'video', 'carousel'],
    allowed_ctas: ['SHOP_NOW', 'BUY_NOW'],
  },
  LINK_CLICKS: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['LEARN_MORE', 'SHOP_NOW'],
    requires_url: true,
  },
  VIDEO_VIEWS: {
    allowed_formats: ['video'],
    allowed_ctas: ['WATCH_MORE'],
  },
  MESSAGES: {
    allowed_formats: ['image', 'video'],
    allowed_ctas: ['SEND_MESSAGE'],
  },
  CONVERSIONS: {
    allowed_formats: ['image', 'video', 'carousel'],
    allowed_ctas: ['SHOP_NOW', 'SIGN_UP'],
  },
};

// --- Final Ad Rules ---
export interface AdRules {
  requires_creative: boolean;
  allowed_statuses: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[];
  requires_review?: boolean;
}

export const adRules: Record<CampaignObjective, AdRules> = {
  BRAND_AWARENESS: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
    requires_review: true,
  },
  REACH: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  POST_ENGAGEMENT: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  LEAD_GENERATION: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
    requires_review: true,
  },
  APP_INSTALLS: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  OUTCOME_SALES: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  LINK_CLICKS: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  VIDEO_VIEWS: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  MESSAGES: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
  CONVERSIONS: {
    requires_creative: true,
    allowed_statuses: ['ACTIVE', 'PAUSED'],
  },
};
