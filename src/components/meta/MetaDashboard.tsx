'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useMetaDashboard } from '../../lib/hooks/useMetaDashboard';
import { MetaMetricCards } from './MetaMetricCards';
import { MetaCampaignTable } from './MetaCampaignTable';
import { MetaAdSetTable } from './MetaAdSetTable';
import { MetaAdTable } from './MetaAdTable';
import { MetaLoadMoreButton } from './MetaLoadMoreButton';
import { DATE_RANGE_OPTIONS } from '../../lib/utils/constants';

interface MetaDashboardProps {
  accessToken: string;
  accountId: string;
}

export function MetaDashboard({ accessToken, accountId }: MetaDashboardProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'adSets' | 'ads'>('campaigns');
  const [selectedDateRange, setSelectedDateRange] = useState('last_30d');
  const [currentTime, setCurrentTime] = useState<string>(''); // ✅ NEW - for client-only date
  
  const {
    campaigns,
    adSets,
    ads,
    summary,
    loading,
    loadingMore,
    loadingCreatives,
    hasMore,
    error,
    loadMore,
    loadCreatives,
    refresh,
    setDateRange,
  } = useMetaDashboard(accessToken, accountId);

  // ✅ NEW - Set date only on client side
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
    if (value === 'custom') {
      // Handle custom range - show date picker
      return;
    }
    setDateRange({ preset: value });
  };

  // Handle tab change - load creatives when switching to ads tab
  const handleTabChange = (tab: 'campaigns' | 'adSets' | 'ads') => {
    setActiveTab(tab);
    if (tab === 'ads' && ads.length > 0) {
      const adIds = ads.map(ad => ad.id);
      loadCreatives(adIds);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {error}
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Meta Ads Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Account: {accountId}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedDateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <MetaMetricCards summary={summary} loading={loading} />

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex gap-6">
            <button
              onClick={() => handleTabChange('campaigns')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Campaigns
              <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {campaigns.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('adSets')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'adSets'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Ad Sets
              <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {adSets.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('ads')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ads'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Ads
              <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {ads.length}
              </span>
              {loadingCreatives && (
                <span className="ml-2 text-xs text-blue-500">Loading creatives...</span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <>
            <MetaCampaignTable campaigns={campaigns} loading={loading} />
            <MetaLoadMoreButton
              hasMore={hasMore.campaigns}
              loading={loadingMore.campaigns}
              onClick={() => loadMore('campaigns')}
              count={campaigns.length}
            />
          </>
        )}

        {activeTab === 'adSets' && (
          <>
            <MetaAdSetTable adSets={adSets} loading={loading} />
            <MetaLoadMoreButton
              hasMore={hasMore.adSets}
              loading={loadingMore.adSets}
              onClick={() => loadMore('adSets')}
              count={adSets.length}
            />
          </>
        )}

        {activeTab === 'ads' && (
          <>
            <MetaAdTable ads={ads} loading={loading} loadingCreatives={loadingCreatives} />
            <MetaLoadMoreButton
              hasMore={hasMore.ads}
              loading={loadingMore.ads}
              onClick={() => loadMore('ads')}
              count={ads.length}
            />
          </>
        )}

        {/* Footer - FIXED: Use client-only date */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-4 border-t border-slate-200 dark:border-slate-800">
          Data is updated in real-time • Last sync: {currentTime || 'Loading...'}
        </div>
      </div>
    </div>
  );
}