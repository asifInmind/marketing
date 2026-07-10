// services/adSetApi.ts

interface CreateAdSetPayload {
  name: string;
  campaign_id: string;
  daily_budget: number;
  status: string;
  billing_event?: string;
  optimization_goal?: string;
  bid_strategy?: string;
  bid_amount?: number;
  targeting?: Record<string, any>;
  promoted_object?: {
    page_id?: string;
    pixel_id?: string;
    custom_event_type?: string;
    application_id?: string;
    object_store_url?: string;
  };
  start_time?: string;
  end_time?: string;
  special_ad_categories?: string[];
}

export async function createNewAdSet(
  payload: CreateAdSetPayload,
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v25.0/${cleanActId}/adsets`;

  // Default parameters
  const billingEvent = payload.billing_event || 'IMPRESSIONS';
  const optimizationGoal = payload.optimization_goal || 'LINK_CLICKS';
  const bidStrategy = payload.bid_strategy || 'LOWEST_COST_WITHOUT_CAP';
  const targetingObj = payload.targeting || { geo_locations: { countries: ['US'] } };

  // ✅ Build the body as a proper object first
  const bodyObj: any = {
    name: payload.name,
    campaign_id: payload.campaign_id,
    daily_budget: payload.daily_budget,
    status: payload.status,
    billing_event: billingEvent,
    optimization_goal: optimizationGoal,
    bid_strategy: bidStrategy,
    targeting: targetingObj,
  };

  // ✅ Add bid_amount if provided (required for COST_CAP, BID_CAP, TARGET_COST)
  if (payload.bid_amount !== undefined && payload.bid_amount !== null) {
    bodyObj.bid_amount = payload.bid_amount;
  }

  // ✅ Add promoted_object if provided
  if (payload.promoted_object) {
    bodyObj.promoted_object = payload.promoted_object;
  }

  // ✅ Add start_time if provided
  if (payload.start_time) {
    bodyObj.start_time = payload.start_time;
  }

  // ✅ Add end_time if provided
  if (payload.end_time) {
    bodyObj.end_time = payload.end_time;
  }

  // ✅ Add special_ad_categories if provided
  if (payload.special_ad_categories && payload.special_ad_categories.length > 0) {
    bodyObj.special_ad_categories = payload.special_ad_categories;
  }

  // ✅ Clean up undefined values
  Object.keys(bodyObj).forEach(key => {
    if (bodyObj[key] === undefined || bodyObj[key] === null) {
      delete bodyObj[key];
    }
  });

  console.log('📤 Creating Ad Set with payload:', JSON.stringify(bodyObj, null, 2));

  // ✅ Send as JSON with Authorization header
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(bodyObj),
  });

  const json = await res.json();

  if (json.error) {
    console.error('❌ Full Meta AdSet Error:', json.error);
    throw new Error(json.error.error_user_msg || json.error.message || 'Failed to create ad set');
  }

  console.log('✅ Ad Set created:', json);
  return json;
}

// ✅ Helper function to get valid optimization goals for a campaign objective
export const getValidOptimizationGoals = (objective: string): string[] => {
  // In adSetApi.ts - UPDATE THIS!
const OBJECTIVE_TO_GOALS: Record<string, string[]> = {
  'OUTCOME_AWARENESS': ['REACH', 'IMPRESSIONS', 'AD_RECALL_LIFT'],
  'OUTCOME_TRAFFIC': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS'],
  'OUTCOME_ENGAGEMENT': ['POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES'],
  'OUTCOME_LEADS': ['LEAD_GENERATION', 'QUALITY_LEAD'],
  'OUTCOME_APP_PROMOTION': ['APP_INSTALLS'],
  'OUTCOME_SALES': ['VALUE'], // ← REMOVED OFFSITE_CONVERSIONS, only VALUE works
};
  return OBJECTIVE_TO_GOALS[objective] || ['REACH', 'IMPRESSIONS'];
};

// ✅ Helper function to get billing event for an optimization goal
export const getBillingEventForGoal = (optimizationGoal: string): string => {
  const BILLING_EVENT_MAP: Record<string, string> = {
    'REACH': 'IMPRESSIONS',
    'IMPRESSIONS': 'IMPRESSIONS',
    'LINK_CLICKS': 'LINK_CLICKS',
    'LANDING_PAGE_VIEWS': 'IMPRESSIONS',
    'POST_ENGAGEMENT': 'POST_ENGAGEMENT',
    'PAGE_LIKES': 'PAGE_LIKES',
    'LEAD_GENERATION': 'IMPRESSIONS',
    'QUALITY_LEAD': 'IMPRESSIONS',
    'APP_INSTALLS': 'APP_INSTALLS',
    'OFFSITE_CONVERSIONS': 'IMPRESSIONS',
    'VALUE': 'IMPRESSIONS',
    'AD_RECALL_LIFT': 'IMPRESSIONS',
    'EVENT_RESPONSES': 'IMPRESSIONS',
  };
  return BILLING_EVENT_MAP[optimizationGoal] || 'IMPRESSIONS';
};

// ✅ Bid strategies
export const BID_STRATEGIES = [
  { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost Without Cap' },
  { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Lowest Cost With Bid Cap' },
  { value: 'COST_CAP', label: 'Cost Cap' },
  { value: 'BID_CAP', label: 'Bid Cap' },
  { value: 'TARGET_COST', label: 'Target Cost' },
];