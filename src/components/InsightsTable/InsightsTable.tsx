'use client';
import React from 'react';
import { InsightsSection } from '../insights/Insights';
import { Ad, AdSet, Campaign, Insight } from '../../Types';

interface Props {
    selectedAccountId: string;
    campaigns: Campaign[];
    adsets: AdSet[];
    ads: Ad[];
    expandedCampaigns: Record<string, Insight[]>;
    expandedAdsets: Record<string, Insight[]>;
    expandedAds: Record<string, Insight[]>;
    fetchInsights: (id: string, type: 'campaigns' | 'adsets' | 'ads') => void;
    }

    export const InsightsTables: React.FC<Props> = ({
    selectedAccountId,
    campaigns,
    adsets,
    ads,
    expandedCampaigns,
    expandedAdsets,
    expandedAds,
    fetchInsights,
    }) => {
    const campaignInsightCols = [
        { key: 'impressions', label: 'Impressions' },
        { key: 'reach', label: 'Reach' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR' },
        { key: 'cpc', label: 'CPC' },
        { key: 'cpm', label: 'CPM' },
        { key: 'spend', label: 'Spend' },
        { key: 'conversion_rate_ranking', label: 'Conv. Rate Rank' },
    ];

    const adsetInsightCols = [
        { key: 'campaign_name', label: 'Campaign Name' },
        { key: 'reach', label: 'Reach' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR' },
        { key: 'cpc', label: 'CPC' },
        { key: 'spend', label: 'Spend' },
    ];

    const adInsightCols = [
        { key: 'impressions', label: 'Ad Impressions' },
        { key: 'reach', label: 'Ad Reach' },
        { key: 'spend', label: 'Spenditure' },
        { key: 'campaign_name', label: 'Campaign Name' },
        { key: 'cpc', label: 'CPC' },
    ];

    return (
        <div className="mt-10">
        <InsightsSection
            title="Campaigns"
            data={campaigns}
            columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'objective', label: 'Objective' },
                { key: 'start_time', label: 'Start' },
                { key: 'stop_time', label: 'End' },
            ]}
            insightColumns={campaignInsightCols}
            expanded={expandedCampaigns}
            fetchInsights={fetchInsights}
            type="campaigns"
        />

        <InsightsSection
            title="Ad Sets"
            data={adsets}
            columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'campaign_id', label: 'Campaign ID' },
                { key: 'campaign_name', label: 'Campaign Name' },
                { key: 'status', label: 'Status' },
                { key: 'daily_budget', label: 'Daily Budget' },
                { key: 'start_time', label: 'Start' },
                { key: 'end_time', label: 'End' },
            ]}
            insightColumns={adsetInsightCols}
            expanded={expandedAdsets}
            fetchInsights={fetchInsights}
            type="adsets"
        />

        <InsightsSection
            title="Ads"
            data={ads}
            columns={[
                { key: 'name', label: 'Ad Name' },
                { key: 'status', label: 'Ad Status' },
                { key: 'impressions', label: 'Impressions' },
                { key: 'cpm', label: 'CPM' },
                { key: 'preview_shareable_link', label: 'Preview Shareable Link' },
                { key: 'campaign_name', label: 'Campaign Name' },
                { key: 'cpc', label: 'CPC' },
                { key: 'date_start', label: 'Ad Starting Date' },
                { key: 'date_stop', label: 'Ad Ending Date' },
                { key: 'ad_active_time', label: 'Ad Active Time' },
            ]}
            insightColumns={adInsightCols}
            expanded={expandedAds}
            fetchInsights={fetchInsights}
            type="ads"
        />
        </div>
    );
};
