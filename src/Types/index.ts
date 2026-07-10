export type Campaign = {
    id: string;
    name: string;
    status: string;
    effective_status: string;
    objective: string;
    start_time: string;
    stop_time: string;
};

export type AdSet = {
    id: string;
    name: string;
    campaign_id: string;
    status: string;
    daily_budget: string;
    start_time: string;
    end_time: string;
    bid_strategy: string;
    optimization_goal: string;
};

export type Ad = {
    id: string;
    name: string;
    adset_id: string;
    campaign_id: string;
    status: string;
    bid_amount: string;
    creative?: { id: string };
    created_time: string;
};

export type Insight = {
    impressions: string;
    reach: string;
    clicks?: string;
    spend: string;
    cpc?: string;
    cpm?: string;
    ctr?: string;
    actions?: { action_type: string; value: string }[];
    action_values?: { action_type: string; value: string }[];
    cost_per_action_type?: { action_type: string; value: string }[];
    conversion_rate_ranking?: string;
    quality_ranking?: string;
};
