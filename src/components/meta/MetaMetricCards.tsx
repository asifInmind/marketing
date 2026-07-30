'use client';

import React from 'react';
import {
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,  // ✅ ADD THIS - was missing!
} from 'lucide-react';
import type { DashboardData } from '../../lib/types/meta.types';

interface MetaMetricCardsProps {
  summary: DashboardData['summary'];
  loading: boolean;
}

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  loading,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon: React.ElementType;
  color: string;
  loading: boolean;
  subtitle?: string;
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {/* {change && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            change.isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change.value}%
          </span>
        )} */}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
        {subtitle && (
          <p className={`text-xs font-medium mt-1 ${
            typeof value === 'number' && value > 1 ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export function MetaMetricCards({ summary, loading }: MetaMetricCardsProps) {
  // Calculate change percentages (mock for now)
  const changes = {
    spend: { value: 12.5, isPositive: true },
    clicks: { value: 8.3, isPositive: true },
    impressions: { value: 5.7, isPositive: true },
    conversions: { value: 15.2, isPositive: true },
    revenue: { value: 22.1, isPositive: true },
  };

  // Format ROAS as multiplier (e.g., 2.5x)
  const roasDisplay = summary?.averageROAS && summary.averageROAS > 0 
    ? `${summary.averageROAS.toFixed(2)}x` 
    : '0x';

  // Determine ROAS performance
  const getROASSubtitle = (roas: number) => {
    if (roas === 0) return 'No revenue yet';
    if (roas > 3) return '🚀 Excellent ROI';
    if (roas > 2) return '✅ Good ROI';
    if (roas > 1) return '📈 Breaking even';
    return '⚠️ Below break-even';
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Spend"
          value={`$${summary?.totalSpend?.toFixed(2) || '0.00'}`}
          change={changes.spend}
          icon={DollarSign}
          color="bg-emerald-500"
          loading={loading}
        />
        <MetricCard
          title="Total Clicks"
          value={summary?.totalClicks || 0}
          change={changes.clicks}
          icon={MousePointerClick}
          color="bg-blue-500"
          loading={loading}
        />
        <MetricCard
          title="Total Impressions"
          value={summary?.totalImpressions || 0}
          change={changes.impressions}
          icon={Eye}
          color="bg-purple-500"
          loading={loading}
        />
        <MetricCard
          title="Conversions"
          value={summary?.totalConversions || 0}
          change={changes.conversions}
          icon={Target}
          color="bg-amber-500"
          loading={loading}
        />
        <MetricCard
          title="Revenue"
          value={`$${summary?.totalRevenue?.toFixed(2) || '0.00'}`}
          change={changes.revenue}
          icon={Wallet}
          color="bg-indigo-500"
          loading={loading}
        />
        <MetricCard
          title="ROAS"
          value={roasDisplay}
          icon={Percent}
          color="bg-violet-600"
          loading={loading}
          subtitle={getROASSubtitle(summary?.averageROAS || 0)}
        />
      </div>
    </>
  );
}