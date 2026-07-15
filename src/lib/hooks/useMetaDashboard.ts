'use client'
// ============================================
// USE META DASHBOARD HOOK
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCompleteDashboard,
  loadMoreCampaigns,
  loadMoreAdSets,
  loadMoreAds,
  loadCreativesForAds,
} from '../api/metaApi';
import {
  transformCampaigns,
  transformAdSets,
  transformAds,
} from '../utils/metaTransformers';
import type {
  MetaConfig,
  DashboardData,
  TransformedCampaign,
  TransformedAdSet,
  TransformedAd,
} from '../types/meta.types';

interface UseMetaDashboardReturn {
  // Data
  campaigns: TransformedCampaign[];
  adSets: TransformedAdSet[];
  ads: TransformedAd[];
  summary: DashboardData['summary'];
  
  // Loading states
  loading: boolean;
  loadingMore: {
    campaigns: boolean;
    adSets: boolean;
    ads: boolean;
  };
  loadingCreatives: boolean;
  
  // Pagination
  hasMore: {
    campaigns: boolean;
    adSets: boolean;
    ads: boolean;
  };
  
  // Errors
  error: string | null;
  
  // Actions
  loadMore: (type: 'campaigns' | 'adSets' | 'ads') => Promise<void>;
  loadCreatives: (adIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
  setDateRange: (range: { since?: string; until?: string; preset?: string }) => void;
}

export function useMetaDashboard(
  accessToken: string,
  accountId: string
): UseMetaDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState({
    campaigns: false,
    adSets: false,
    ads: false,
  });
  const [loadingCreatives, setLoadingCreatives] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ preset?: string; since?: string; until?: string }>({
    preset: 'last_30d',
  });
  
  const configRef = useRef<MetaConfig>({
    accessToken,
    accountId,
    dateRange,
  });
  
  // Update config when params change
  useEffect(() => {
    configRef.current = {
      accessToken,
      accountId,
      dateRange,
    };
  }, [accessToken, accountId, dateRange]);
  
  // Transform data
  const transformedData = useCallback(() => {
    if (!data) return null;
    
    return {
      campaigns: transformCampaigns(data.campaigns, data.campaignInsights),
      adSets: transformAdSets(data.adSets, data.adSetInsights),
      ads: transformAds(data.ads, data.adInsights, data.creatives),
      summary: data.summary,
    };
  }, [data]);
  
  // Fetch dashboard data
  // In src/lib/hooks/useMetaDashboard.ts

// Replace the fetchDashboard function with this:
const fetchDashboard = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
        console.log('📡 Fetching dashboard data...');
    console.log('🔑 Access Token:', configRef.current.accessToken?.substring(0, 20) + '...');
    console.log('📋 Account ID:', configRef.current.accountId);
    console.log('📅 Date Range:', configRef.current.dateRange);
    // Use the API route
    const params = new URLSearchParams({
      access_token: configRef.current.accessToken,
      account_id: configRef.current.accountId,
      date_preset: configRef.current.dateRange?.preset || 'last_30d',
      page_size: String(configRef.current.pageSize || 100),
    });

    if (configRef.current.dateRange?.since) {
      params.append('since', configRef.current.dateRange.since);
    }
    if (configRef.current.dateRange?.until) {
      params.append('until', configRef.current.dateRange.until);
    }

    const response = await fetch(`/api/meta?${params.toString()}`);
    const result = await response.json();
     console.log('✅ Raw API Result:', result);
    console.log('📊 Campaigns count:', result.campaigns?.length || 0);
    console.log('📊 Ad Sets count:', result.adSets?.length || 0);
    console.log('📊 Ads count:', result.ads?.length || 0);
    console.log('📊 Campaign Insights:', Object.keys(result.campaignInsights || {}).length);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }

    setData(result.data);
  } catch (err: any) {
    setError(err.message || 'Failed to fetch dashboard data');
    setData(null);
  } finally {
    setLoading(false);
  }
}, []);
  
  // Load more function
  const loadMore = useCallback(async (type: 'campaigns' | 'adSets' | 'ads') => {
    if (!data) return;
    
    const typeMap = {
      campaigns: {
        hasMore: data.pagination.campaigns.hasMore,
        after: data.pagination.campaigns.after,
        loader: loadMoreCampaigns,
        setter: (newData: any) => {
          setData(prev => ({
            ...prev!,
            campaigns: [...prev!.campaigns, ...newData.data],
            pagination: {
              ...prev!.pagination,
              campaigns: {
                hasMore: !!newData.paging?.next,
                after: newData.paging?.cursors?.after,
              },
            },
          }));
        },
      },
      adSets: {
        hasMore: data.pagination.adSets.hasMore,
        after: data.pagination.adSets.after,
        loader: loadMoreAdSets,
        setter: (newData: any) => {
          setData(prev => ({
            ...prev!,
            adSets: [...prev!.adSets, ...newData.data],
            pagination: {
              ...prev!.pagination,
              adSets: {
                hasMore: !!newData.paging?.next,
                after: newData.paging?.cursors?.after,
              },
            },
          }));
        },
      },
      ads: {
        hasMore: data.pagination.ads.hasMore,
        after: data.pagination.ads.after,
        loader: loadMoreAds,
        setter: (newData: any) => {
          setData(prev => ({
            ...prev!,
            ads: [...prev!.ads, ...newData.data],
            pagination: {
              ...prev!.pagination,
              ads: {
                hasMore: !!newData.paging?.next,
                after: newData.paging?.cursors?.after,
              },
            },
          }));
        },
      },
    };
    
    const config = typeMap[type];
    if (!config.hasMore || !config.after) return;
    
    setLoadingMore(prev => ({ ...prev, [type]: true }));
    
    try {
      const result = await config.loader(
        configRef.current,
        config.after
      );
      config.setter(result);
    } catch (err: any) {
      setError(err.message || `Failed to load more ${type}`);
    } finally {
      setLoadingMore(prev => ({ ...prev, [type]: false }));
    }
  }, [data]);
  
  // Load creatives for ads
  const loadCreatives = useCallback(async (adIds: string[]) => {
    if (!data || adIds.length === 0) return;
    
    // Filter ads that don't have creatives yet
    const adsWithoutCreatives = data.ads.filter(
      ad => adIds.includes(ad.id) && !data.creatives[ad.id]
    );
    
    if (adsWithoutCreatives.length === 0) return;
    
    setLoadingCreatives(true);
    
    try {
      const creativeMap = await loadCreativesForAds(
        adsWithoutCreatives,
        configRef.current
      );
      
      setData(prev => ({
        ...prev!,
        creatives: {
          ...prev!.creatives,
          ...creativeMap,
        },
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load creatives');
    } finally {
      setLoadingCreatives(false);
    }
  }, [data]);
  
  // Set date range
  const handleSetDateRange = useCallback((range: { since?: string; until?: string; preset?: string }) => {
    setDateRange(range);
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  
  // Refresh when date range changes
  useEffect(() => {
    if (!loading) {
      fetchDashboard();
    }
  }, [dateRange]);
  
  const transformed = transformedData();
  
  return {
    campaigns: transformed?.campaigns || [],
    adSets: transformed?.adSets || [],
    ads: transformed?.ads || [],
    summary: data?.summary || {
     totalCampaigns: data?.summary.totalCampaigns || 0,
    totalAdSets: data?.summary.totalAdSets || 0,
    totalAds: data?.summary.totalAds || 0,
    totalSpend: data?.summary.totalSpend || 0,
    totalImpressions: data?.summary.totalImpressions || 0,
    totalClicks: data?.summary.totalClicks || 0,
    totalConversions: data?.summary.totalConversions || 0,
    totalRevenue: data?.summary.totalRevenue || 0,        // ✅ NEW
    avgCTR: data?.summary.avgCTR || 0,
    avgCPC: data?.summary.avgCPC || 0,
    avgROAS: data?.summary.avgROAS || 0,                  // ✅ NEW
    activeCampaigns: data?.summary.activeCampaigns || 0,
    pausedCampaigns: data?.summary.pausedCampaigns || 0,
    },
    loading,
    loadingMore,
    loadingCreatives,
    hasMore: {
      campaigns: data?.pagination.campaigns.hasMore || false,
      adSets: data?.pagination.adSets.hasMore || false,
      ads: data?.pagination.ads.hasMore || false,
    },
    error,
    loadMore,
    loadCreatives,
    refresh: fetchDashboard,
    setDateRange: handleSetDateRange,
  };
}