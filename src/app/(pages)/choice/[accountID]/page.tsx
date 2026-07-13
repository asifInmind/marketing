'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { Ad, AdSet, Campaign, Insight } from '../../../../Types/index';
import { InsightsTables } from '../../../../components/InsightsTable/InsightsTable';
import FlatAdsDashboard from '../../../(newpages)/dashboard/page';

// ✅ This component contains the actual logic with useSearchParams
function DashboardContent() {
    const { accountID } = useParams();
    const searchParams = useSearchParams();
    const accessToken = searchParams.get('access_token') ?? '';
    console.log('accountId:', accountID);
    console.log('accessToken:', accessToken);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [adsets, setAdsets] = useState<AdSet[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [error, setError] = useState('');

    const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, Insight[]>>({});
    const [expandedAdsets, setExpandedAdsets] = useState<Record<string, Insight[]>>({});
    const [expandedAds, setExpandedAds] = useState<Record<string, Insight[]>>({});
    const router = useRouter();

    const fetchData = async (url: string, setter: Function, enrichWithCampaigns = false) => {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) {
                setError(data.error.message);
                return;
            }

            let adjustedData = data.data.map((item: any) => {
                const insights = item.insights?.data?.[0] || {};
                return {
                    ...item,
                    ...insights,
                    daily_budget: item.daily_budget ? item.daily_budget / 100 : undefined,
                    cpc: insights.cpc,
                    ctr: insights.ctr,
                    spend: insights.spend,
                    campaign_name: insights.campaign_name,
                };
            });

            if (enrichWithCampaigns) {
                adjustedData = adjustedData.map((item: any) => {
                    const campaign = campaigns.find(c => c.id === item.campaign_id || item.campaign?.id);
                    return {
                        ...item,
                        campaign_name: campaign?.name || 'N/A',
                    };
                });
            }

            setter(adjustedData);
        } catch {
            setError('Failed to fetch data.');
        }
    };

    const getInsightFields = (type: 'campaigns' | 'adsets' | 'ads') => {
        switch (type) {
            case 'campaigns':
                return 'impressions,reach,clicks,spend,cpc,cpm,ctr,actions,action_values,conversion_rate_ranking';
            case 'adsets':
                return 'impressions,reach,clicks,spend,ctr,cpc,actions,action_values,cost_per_action_type,campaign_name';
            case 'ads':
                return 'impressions,reach,spend,cpc,cpm,ctr,actions,action_values,conversion_rate_ranking,quality_ranking,campaign_name';
            default:
                return 'impressions,spend';
        }
    };

    const fetchInsights = async (id: string, type: 'campaigns' | 'adsets' | 'ads') => {
        const isAlreadyExpanded =
            (type === 'campaigns' && expandedCampaigns[id]) ||
            (type === 'adsets' && expandedAdsets[id]) ||
            (type === 'ads' && expandedAds[id]);

        if (isAlreadyExpanded) {
            const remove = (setState: Function) =>
                setState((prev: any) => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });

            if (type === 'campaigns') remove(setExpandedCampaigns);
            else if (type === 'adsets') remove(setExpandedAdsets);
            else remove(setExpandedAds);

            return;
        }

        const fields = getInsightFields(type);
        const url = `https://graph.facebook.com/v22.0/${id}/insights?fields=${fields}&access_token=${accessToken}`;
        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                setError(data.error.message);
                return;
            }

            const safeData = data.data.map((entry: any) => {
                const { cost_per_action_type, ...rest } = entry;
                return rest;
            });

            if (type === 'campaigns') {
                setExpandedCampaigns(prev => ({ ...prev, [id]: safeData }));
            } else if (type === 'adsets') {
                setExpandedAdsets(prev => ({ ...prev, [id]: safeData }));
            } else {
                setExpandedAds(prev => ({ ...prev, [id]: safeData }));
            }
        } catch {
            setError('Failed to fetch insights.');
        }
    };

    useEffect(() => {
        if (!accountID || !accessToken) return;

        const actId = `act_${accountID}`;

        const fetchAll = async () => {
            await fetchData(
                `https://graph.facebook.com/v19.0/${actId}/campaigns?fields=id,name,status,effective_status,objective,start_time,stop_time&access_token=${accessToken}`,
                setCampaigns
            );

            await fetchData(
                `https://graph.facebook.com/v19.0/${actId}/adsets?fields=id,name,campaign_id,status,daily_budget,start_time,end_time,bid_strategy,optimization_goal&access_token=${accessToken}`,
                setAdsets,
                true
            );

            await fetchData(
                `https://graph.facebook.com/v19.0/${actId}/ads?fields=campaign,creative,preview_shareable_link,adcreatives{instagram_user_id},name,status,insights{campaign_name,cost_per_conversion,cost_per_action_type,cpc,cpm,cpp,ctr,date_start,date_stop,impressions},ad_active_time&access_token=${accessToken}`,
                setAds,
                true
            );
        };

        fetchAll();
    }, [accountID, accessToken]);

    return (
        <>
        {/* <div className="p-6">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <InsightsTables
                selectedAccountId={accountID as string}
                campaigns={campaigns}
                adsets={adsets}
                ads={ads}
                expandedCampaigns={expandedCampaigns}
                expandedAdsets={expandedAdsets}
                expandedAds={expandedAds}
                fetchInsights={fetchInsights}
            />
            <button onClick={() =>  router.push(`/campaign?act_id=${accountID}&access_token=${accessToken}`)} className="px-6 py-3 bg-fuchsia-400 text-white font-semibold rounded-md mb-20 cursor-pointer">
                Create a new ad?
            </button>
        </div> */}
        <div>
            <FlatAdsDashboard/>
        </div>
        </>
    );
}

// ✅ Default export with Suspense boundary
export default function DashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}