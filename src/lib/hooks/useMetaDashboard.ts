'use client'
// ============================================
// USE META DASHBOARD HOOK
// ============================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const EMPTY_ARRAY: any[] = [];
const DEFAULT_META_SUMMARY = {
  totalCampaigns: 0,
  totalAdSets: 0,
  totalAds: 0,
  totalSpend: 0,
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  totalRevenue: 0,
  avgCTR: 0,
  avgCPC: 0,
  avgROAS: 0,
  activeCampaigns: 0,
  pausedCampaigns: 0,
  averageROAS: 0,
};
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
  loadingInsights: boolean;
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
  const [loadingInsights, setLoadingInsights] = useState(true);
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
  
  // Transform data (memoized to prevent new array references on every render)
  const transformed = useMemo(() => {
    if (!data) return null;
    
    return {
      campaigns: transformCampaigns(data.campaigns, data.campaignInsights),
      adSets: transformAdSets(data.adSets, data.adSetInsights),
      ads: transformAds(data.ads, data.adInsights, data.creatives),
      summary: data.summary,
    };
  }, [data]);
  
  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setLoadingInsights(true);
    setError(null);
    
    const baseParams = new URLSearchParams({
      access_token: configRef.current.accessToken,
      account_id: configRef.current.accountId,
      date_preset: configRef.current.dateRange?.preset || 'last_30d',
      page_size: String(configRef.current.pageSize || 100),
    });

    if (configRef.current.dateRange?.since) {
      baseParams.append('since', configRef.current.dateRange.since);
    }
    if (configRef.current.dateRange?.until) {
      baseParams.append('until', configRef.current.dateRange.until);
    }

    try {
      console.log('📡 Step 1: Fetching dashboard structure...');
      const structParams = new URLSearchParams(baseParams);
      structParams.append('type', 'structure');

      const structResponse = await fetch(`/api/meta?${structParams.toString()}`);
      const structResult = await structResponse.json();

      if (!structResult.success) {
        throw new Error(structResult.error || 'Failed to fetch dashboard structure');
      }

      console.log('✅ Structure fetched:', {
        campaigns: structResult.data.campaigns?.length || 0,
        adSets: structResult.data.adSets?.length || 0,
        ads: structResult.data.ads?.length || 0,
      });

      setData(structResult.data);
      setLoading(false); // Stop structure loading spinner, show UI

      // Step 2: Fetch insights in the background
      console.log('📡 Step 2: Fetching dashboard insights...');
      const insightsParams = new URLSearchParams(baseParams);
      insightsParams.append('type', 'insights');

      fetch(`/api/meta?${insightsParams.toString()}`)
        .then(res => res.json())
        .then(insightsResult => {
          if (insightsResult.success) {
            console.log('✅ Insights fetched successfully');
            setData(prev => {
              if (!prev) return null;
              return {
                ...prev,
                campaignInsights: insightsResult.data.campaignInsights || {},
                adSetInsights: insightsResult.data.adSetInsights || {},
                adInsights: insightsResult.data.adInsights || {},
                summary: {
                  ...prev.summary,
                  ...insightsResult.data.summary,
                },
                loading: {
                  ...prev.loading,
                  insights: false
                }
              };
            });
          } else {
            console.warn('⚠️ Insights fetching failed:', insightsResult.error);
          }
        })
        .catch(err => {
          console.warn('⚠️ Insights network error:', err);
        })
        .finally(() => {
          setLoadingInsights(false);
        });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      setData(null);
      setLoading(false);
      setLoadingInsights(false);
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
  
  const hasMore = useMemo(() => ({
    campaigns: data?.pagination.campaigns.hasMore || false,
    adSets: data?.pagination.adSets.hasMore || false,
    ads: data?.pagination.ads.hasMore || false,
  }), [
    data?.pagination.campaigns.hasMore,
    data?.pagination.adSets.hasMore,
    data?.pagination.ads.hasMore
  ]);
  
  return {
    campaigns: transformed?.campaigns || EMPTY_ARRAY,
    adSets: transformed?.adSets || EMPTY_ARRAY,
    ads: transformed?.ads || EMPTY_ARRAY,
    summary: data?.summary || DEFAULT_META_SUMMARY,
    loading,
    loadingInsights,
    loadingMore,
    loadingCreatives,
    hasMore,
    error,
    loadMore,
    loadCreatives,
    refresh: fetchDashboard,
    setDateRange: handleSetDateRange,
  };
}