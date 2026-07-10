'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  PlusIcon,
  MegaphoneIcon, 
  FolderIcon, 
  RectangleStackIcon, 
  ArrowRightIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { fetchAllDashboardData } from '../../../services/campaignApi';

export default function FlatAdsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token') || undefined;

  let rawActId: string | null = null;
  
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/');
    const choiceIndex = pathSegments.indexOf('choice');
    if (choiceIndex !== -1 && pathSegments[choiceIndex + 1]) {
      rawActId = pathSegments[choiceIndex + 1];
    }
  }

  const actId = rawActId 
    ? (rawActId.startsWith('act_') ? rawActId : `act_${rawActId}`) 
    : null;

  // State for all data
  const [dashboardData, setDashboardData] = useState<any>({
    campaigns: [],
    account: null,
    insights: { campaign: [], adset: [], ad: [] },
    pages: []
  });
  
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<any>(null);
  const [selectedInsightLevel, setSelectedInsightLevel] = useState<'campaign' | 'adset' | 'ad'>('campaign');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !actId) {
      setError('Missing configuration parameters.');
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchAllDashboardData(accessToken, actId);
        
        if (!result.success) {
          throw new Error(result.error);
        }

        setDashboardData(result.data);
        
        // Set default selections
        const campaigns = result.data.campaigns || [];
        if (campaigns.length > 0) {
          setSelectedCampaign(campaigns[0]);
          const firstAdsets = campaigns[0].adsets?.data || [];
          if (firstAdsets.length > 0) {
            setSelectedAdSet(firstAdsets[0]);
          }
        }
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, actId]);

  const getAdsets = (campaign: any) => campaign?.adsets?.data || [];
  const getAds = (adset: any) => adset?.ads?.data || [];

  const getSelectedInsights = () => {
    const { insights } = dashboardData;
    if (selectedInsightLevel === 'campaign' && selectedCampaign) {
      return insights.campaign.find((i: any) => i.campaign_id === selectedCampaign.id);
    }
    if (selectedInsightLevel === 'adset' && selectedAdSet) {
      return insights.adset.find((i: any) => i.adset_id === selectedAdSet.id);
    }
    if (selectedInsightLevel === 'ad') {
      const adIds = getAds(selectedAdSet).map((ad: any) => ad.id);
      return insights.ad.filter((i: any) => adIds.includes(i.ad_id));
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const allCampaigns = dashboardData.campaigns || [];
  const activeAdSetsList = getAdsets(selectedCampaign);
  const activeAdsList = getAds(selectedAdSet);
  const selectedInsights = getSelectedInsights();

  // Format helpers
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num ? `$${num.toFixed(2)}` : '$0.00';
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num ? num.toLocaleString() : '0';
  };

  return (
    <>
      {/* Top Bar with Create Buttons */}
      <div className='flex justify-between items-center bg-orange-100 p-4 shadow-sm border-b border-orange-200'>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedInsightLevel('campaign')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              selectedInsightLevel === 'campaign' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Campaign Insights
          </button>
          <button
            onClick={() => setSelectedInsightLevel('adset')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              selectedInsightLevel === 'adset' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            AdSet Insights
          </button>
          <button
            onClick={() => setSelectedInsightLevel('ad')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              selectedInsightLevel === 'ad' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Ad Insights
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Create buttons */}
          <button
            onClick={() => router.push(`/campaigns/create?access_token=${accessToken}&act_id=${actId}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md"
          >
            <PlusIcon className="w-4 h-4" /> New Campaign
          </button>
          <button 
            onClick={() => router.push(`/adsets/create?access_token=${accessToken}&act_id=${actId}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md"
          > 
            <PlusIcon className="w-4 h-4" /> Create Ad Set
          </button>
           <button 
            onClick={() => router.push(`/ads/create?access_token=${accessToken}&act_id=${actId}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md"
          > 
            <PlusIcon className="w-4 h-4" /> Create Ads
          </button>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="w-full mx-auto p-6 bg-orange-200 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meta Marketing Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Account: <span className="font-mono">{actId}</span></p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboardData.account?.name || 'Account'} - Currency: {dashboardData.account?.currency || 'USD'}
          </p>
        </header>

{/* uncomment this for dynamic data  */}
{/* {selectedInsights && !Array.isArray(selectedInsights) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <EyeIcon className="w-4 h-4" /> Impressions
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(selectedInsights.impressions || 0)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <CursorArrowRaysIcon className="w-4 h-4" /> Clicks
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(selectedInsights.clicks || 0)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <ChartBarIcon className="w-4 h-4" /> CTR
              </div>
              <p className="text-xl font-bold text-gray-900">{selectedInsights.ctr || '0%'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <CurrencyDollarIcon className="w-4 h-4" /> Spend
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedInsights.spend || 0)}</p>
            </div>
          </div>
        )}
         */}
{/* ✅ Alternative layout with icons on top */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-white rounded-xl p-4 shadow-sm  text-center">
    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
      <EyeIcon className="w-5 h-5 text-blue-500" />
    </div>
    <p className="text-xs text-gray-500">Impressions</p>
    <p className="text-xl font-bold text-gray-900">12,847</p>
  </div>
  <div className="bg-white rounded-xl p-4 shadow-sm  text-center">
    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
      <CursorArrowRaysIcon className="w-5 h-5 text-green-500" />
    </div>
    <p className="text-xs text-gray-500">Clicks</p>
    <p className="text-xl font-bold text-gray-900">342</p>
  </div>
  <div className="bg-white rounded-xl p-4 shadow-sm  text-center">
    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
      <ChartBarIcon className="w-5 h-5 text-purple-500" />
    </div>
    <p className="text-xs text-gray-500">CTR</p>
    <p className="text-xl font-bold text-gray-900">2.66%</p>
  </div>
  <div className="bg-white rounded-xl p-4 shadow-sm  text-center">
    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
      <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
    </div>
    <p className="text-xs text-gray-500">Spend</p>
    <p className="text-xl font-bold text-gray-900">$89.23</p>
  </div>
</div>

        {/* 3-Column Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Campaigns */}
          <div className="bg-white  rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
            <div className="p-4  bg-gradient-to-r from-blue-50 to-white flex items-center gap-2.5">
              <MegaphoneIcon className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Campaigns</h2>
              <span className="ml-auto text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {allCampaigns.length}
              </span>
            </div>
            <div className="p-2.5 overflow-y-auto flex-1">
              {allCampaigns.map((camp: any) => (
                <div
                  key={camp.id}
                  onClick={() => {
                    setSelectedCampaign(camp);
                    const adsets = getAdsets(camp);
                    setSelectedAdSet(adsets.length > 0 ? adsets[0] : null);
                  }}
                  className={`p-3 rounded-xl cursor-pointer border mb-1.5 ${
                    selectedCampaign?.id === camp.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <p className="font-medium text-xs text-gray-900 truncate">{camp.name}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">{camp.objective || 'N/A'}</span>
                    <span className="text-[10px] text-blue-500">({getAdsets(camp).length} ad sets)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Sets */}
          <div className="bg-white  rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden scrollbar-none ">
            <div className="p-4  bg-gradient-to-r from-amber-50 to-white flex items-center gap-2.5">
              <FolderIcon className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-gray-800">Ad Sets</h2>
              <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {activeAdSetsList.length}
              </span>
            </div>
            <div className="p-2.5 overflow-y-auto flex-1">
              {activeAdSetsList.map((set: any) => (
                <div
                  key={set.id}
                  onClick={() => setSelectedAdSet(set)}
                  className={`p-3 rounded-xl cursor-pointer border mb-1.5 ${
                    selectedAdSet?.id === set.id
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <p className="font-medium text-xs text-gray-900 truncate">{set.name}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      ${set.daily_budget ? parseInt(set.daily_budget) / 100 : 0}/day
                    </span>
                    <span className="text-[10px] text-purple-500">({getAds(set).length} ads)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ads */}
          <div className="bg-white  rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
            <div className="p-4  bg-gradient-to-r from-purple-50 to-white flex items-center gap-2.5">
              <RectangleStackIcon className="w-4 h-4 text-purple-600" />
              <h2 className="font-semibold text-gray-800">Ads</h2>
              <span className="ml-auto text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {activeAdsList.length}
              </span>
            </div>
            <div className="p-2.5 overflow-y-auto flex-1">
              {activeAdsList.map((ad: any, idx: number) => {
                const insight = dashboardData.insights.ad.find((i: any) => i.ad_id === ad.id);
                return (
                  <div key={ad.id || idx} className="p-3 rounded-xl border border-gray-100 bg-white mb-1.5">
                    <div className="flex justify-between">
                      <p className="font-medium text-xs text-gray-800">{ad.name}</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ad.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ad.status || 'UNKNOWN'}
                      </span>
                    </div>
                    {insight && (
                      <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-500">
                        <span>👁️ {formatNumber(insight.impressions)}</span>
                        <span>🖱️ {formatNumber(insight.clicks)}</span>
                        <span>💰 {formatCurrency(insight.spend)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}