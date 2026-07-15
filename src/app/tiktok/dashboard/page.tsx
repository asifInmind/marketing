'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    MousePointerClick,
    Eye,
    Percent,
    Users,
    Target,
    Calendar,
    Download,
    RefreshCw,
    ChevronDown,
    Filter,
    Search,
    AlertCircle,
    PlayCircle,
    PauseCircle,
    StopCircle,
    ExternalLink,
    Video,
    Music,
    Sparkles,
    Clock,
    Play,
    Heart,
    Share,
    MessageCircle,
} from 'lucide-react';

// ============= TYPES =============
interface Campaign {
    id: string;
    name: string;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';
    type: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    cpc: number;
    conversions: number;
    conversionValue: number;
    budget?: number;
    startDate?: string;
    endDate?: string;
    objective?: string;
    likes?: number;
    shares?: number;
    comments?: number;
    videoViews?: number;
}

interface AdGroup {
    id: string;
    name: string;
    campaignName: string;
    status: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    conversions: number;
    videoViews?: number;
}

interface Ad {
    id: string;
    name: string;
    type: string;
    adGroupName: string;
    campaignName: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    headline?: string;
    description?: string;
    finalUrl?: string;
    videoViews?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    engagement?: number;
    engagementRate?: number;
}

interface DashboardData {
    campaigns: Campaign[];
    adGroups: AdGroup[];
    ads: Ad[];
    summary: {
        totalCampaigns: number;
        totalAdGroups: number;
        totalAds: number;
        totalClicks: number;
        totalImpressions: number;
        totalCost: number;
        totalConversions: number;
        averageCtr: number;
        averageCpc: number;
        activeCampaigns: number;
        pausedCampaigns: number;
        totalVideoViews: number;
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        totalEngagement: number;
        averageEngagementRate: number;
    };
}

// ============= MOCK DATA =============
const MOCK_DATA: DashboardData = {
    campaigns: [
        {
            id: '1',
            name: 'TikTok Brand Awareness Campaign - Q3 2026',
            status: 'ENABLED',
            type: 'VIDEO',
            clicks: 18456,
            impressions: 856789,
            cost: 18450.75,
            ctr: 2.15,
            cpc: 1.00,
            conversions: 434,
            conversionValue: 8678.90,
            budget: 8000,
            startDate: '2026-07-01',
            endDate: '2026-09-30',
            objective: 'Brand Awareness',
            likes: 23456,
            shares: 3456,
            comments: 4567,
            videoViews: 567890,
        },
        {
            id: '2',
            name: 'TikTok Conversion Campaign - High ROAS',
            status: 'ENABLED',
            type: 'VIDEO',
            clicks: 12456,
            impressions: 423456,
            cost: 12450.25,
            ctr: 2.94,
            cpc: 1.00,
            conversions: 289,
            conversionValue: 7345.67,
            budget: 6000,
            startDate: '2026-06-15',
            objective: 'Conversions',
            likes: 12345,
            shares: 2345,
            comments: 3456,
            videoViews: 345678,
        },
        {
            id: '3',
            name: 'TikTok Traffic Campaign - Website Visits',
            status: 'PAUSED',
            type: 'VIDEO',
            clicks: 7890,
            impressions: 287654,
            cost: 8901.50,
            ctr: 2.74,
            cpc: 1.13,
            conversions: 156,
            conversionValue: 4567.89,
            budget: 3000,
            startDate: '2026-05-01',
            endDate: '2026-06-30',
            objective: 'Traffic',
            likes: 7890,
            shares: 1234,
            comments: 2345,
            videoViews: 234567,
        },
        {
            id: '4',
            name: 'TikTok Engagement Campaign - Influencer Collab',
            status: 'ENABLED',
            type: 'VIDEO',
            clicks: 23456,
            impressions: 634567,
            cost: 15678.90,
            ctr: 3.69,
            cpc: 0.67,
            conversions: 445,
            conversionValue: 11876.54,
            budget: 10000,
            startDate: '2026-04-01',
            objective: 'Engagement',
            likes: 34567,
            shares: 5678,
            comments: 7890,
            videoViews: 678901,
        },
        {
            id: '5',
            name: 'TikTok Spark Ads - User Generated Content',
            status: 'REMOVED',
            type: 'SPARK',
            clicks: 5678,
            impressions: 187890,
            cost: 5678.12,
            ctr: 3.02,
            cpc: 1.00,
            conversions: 178,
            conversionValue: 5345.67,
            budget: 4000,
            startDate: '2026-03-01',
            endDate: '2026-05-30',
            objective: 'App Promotion',
            likes: 8901,
            shares: 2345,
            comments: 3456,
            videoViews: 345678,
        },
    ],
    adGroups: [
        {
            id: '1',
            name: 'Ad Group - Brand Story',
            campaignName: 'TikTok Brand Awareness Campaign - Q3 2026',
            status: 'ENABLED',
            clicks: 8678,
            impressions: 434567,
            cost: 8678.90,
            ctr: 2.00,
            conversions: 198,
            videoViews: 345678,
        },
        {
            id: '2',
            name: 'Ad Group - Product Showcase',
            campaignName: 'TikTok Brand Awareness Campaign - Q3 2026',
            status: 'ENABLED',
            clicks: 5456,
            impressions: 223456,
            cost: 5456.78,
            ctr: 2.44,
            conversions: 167,
            videoViews: 234567,
        },
        {
            id: '3',
            name: 'Ad Group - Retargeting',
            campaignName: 'TikTok Conversion Campaign - High ROAS',
            status: 'ENABLED',
            clicks: 4345,
            impressions: 187654,
            cost: 4345.67,
            ctr: 2.31,
            conversions: 145,
            videoViews: 187654,
        },
        {
            id: '4',
            name: 'Ad Group - High Value Keywords',
            campaignName: 'TikTok Traffic Campaign - Website Visits',
            status: 'PAUSED',
            clicks: 4567,
            impressions: 143210,
            cost: 4567.89,
            ctr: 3.19,
            conversions: 89,
            videoViews: 143210,
        },
        {
            id: '5',
            name: 'Ad Group - Viral Content',
            campaignName: 'TikTok Engagement Campaign - Influencer Collab',
            status: 'ENABLED',
            clicks: 12345,
            impressions: 323456,
            cost: 8901.23,
            ctr: 3.82,
            conversions: 234,
            videoViews: 323456,
        },
    ],
    ads: [
        {
            id: '1',
            name: 'TikTok Ad - Brand Story Video',
            type: 'VIDEO',
            adGroupName: 'Ad Group - Brand Story',
            campaignName: 'TikTok Brand Awareness Campaign - Q3 2026',
            clicks: 5456,
            impressions: 223456,
            cost: 5456.78,
            ctr: 2.44,
            headline: 'Discover Our Brand Story',
            description: 'Watch the full story on TikTok',
            finalUrl: 'https://example.com/brand-story',
            videoViews: 223456,
            likes: 12345,
            shares: 2345,
            comments: 3456,
            engagement: 18146,
            engagementRate: 8.12,
        },
        {
            id: '2',
            name: 'TikTok Ad - Product Demo',
            type: 'VIDEO',
            adGroupName: 'Ad Group - Product Showcase',
            campaignName: 'TikTok Brand Awareness Campaign - Q3 2026',
            clicks: 3345,
            impressions: 187654,
            cost: 3345.67,
            ctr: 1.78,
            headline: 'See Our Products in Action',
            description: 'Watch our product demo on TikTok',
            finalUrl: 'https://example.com/product-demo',
            videoViews: 187654,
            likes: 8901,
            shares: 1234,
            comments: 2345,
            engagement: 12480,
            engagementRate: 6.65,
        },
        {
            id: '3',
            name: 'TikTok Ad - Retargeting',
            type: 'VIDEO',
            adGroupName: 'Ad Group - Retargeting',
            campaignName: 'TikTok Conversion Campaign - High ROAS',
            clicks: 2345,
            impressions: 98765,
            cost: 2345.56,
            ctr: 2.38,
            headline: 'You might also like...',
            description: 'Check out our recommended products',
            finalUrl: 'https://example.com/recommended',
            videoViews: 98765,
            likes: 4567,
            shares: 789,
            comments: 1234,
            engagement: 6590,
            engagementRate: 6.67,
        },
        {
            id: '4',
            name: 'TikTok Ad - Traffic Campaign',
            type: 'VIDEO',
            adGroupName: 'Ad Group - High Value Keywords',
            campaignName: 'TikTok Traffic Campaign - Website Visits',
            status: 'PAUSED',
            clicks: 3456,
            impressions: 123456,
            cost: 3456.78,
            ctr: 2.80,
            headline: 'Visit Our Website Today!',
            description: 'Click to learn more',
            finalUrl: 'https://example.com/website',
            videoViews: 123456,
            likes: 5678,
            shares: 890,
            comments: 1456,
            engagement: 8024,
            engagementRate: 6.50,
        },
        {
            id: '5',
            name: 'TikTok Ad - Influencer Collab',
            type: 'SPARK',
            adGroupName: 'Ad Group - Viral Content',
            campaignName: 'TikTok Engagement Campaign - Influencer Collab',
            clicks: 6789,
            impressions: 234567,
            cost: 4567.89,
            ctr: 2.89,
            headline: 'Check Out This Viral Trend!',
            description: 'Join the challenge',
            finalUrl: 'https://example.com/challenge',
            videoViews: 234567,
            likes: 23456,
            shares: 5678,
            comments: 7890,
            engagement: 37024,
            engagementRate: 15.78,
        },
        {
            id: '6',
            name: 'TikTok Ad - Spark UGC',
            type: 'SPARK',
            adGroupName: 'Ad Group - Viral Content',
            campaignName: 'TikTok Engagement Campaign - Influencer Collab',
            clicks: 5678,
            impressions: 167890,
            cost: 4567.89,
            ctr: 3.38,
            headline: 'User Generated Content',
            description: 'See what people are saying',
            finalUrl: 'https://example.com/ugc',
            videoViews: 167890,
            likes: 14567,
            shares: 3456,
            comments: 4567,
            engagement: 22590,
            engagementRate: 13.45,
        },
    ],
    summary: {
        totalCampaigns: 5,
        totalAdGroups: 5,
        totalAds: 6,
        totalClicks: 67890,
        totalImpressions: 2345678,
        totalCost: 56789.12,
        totalConversions: 867,
        averageCtr: 2.89,
        averageCpc: 0.84,
        activeCampaigns: 3,
        pausedCampaigns: 1,
        totalVideoViews: 1795678,
        totalLikes: 89012,
        totalShares: 14567,
        totalComments: 23456,
        totalEngagement: 127035,
        averageEngagementRate: 7.07,
    },
};

// ============= COMPONENTS =============

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { color: string; icon: JSX.Element; label: string }> = {
        ENABLED: {
            color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            icon: <PlayCircle className="w-3.5 h-3.5" />,
            label: 'Active',
        },
        PAUSED: {
            color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            icon: <PauseCircle className="w-3.5 h-3.5" />,
            label: 'Paused',
        },
        REMOVED: {
            color: 'bg-red-500/15 text-red-400 border-red-500/30',
            icon: <StopCircle className="w-3.5 h-3.5" />,
            label: 'Removed',
        },
        UNKNOWN: {
            color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
            icon: <AlertCircle className="w-3.5 h-3.5" />,
            label: 'Unknown',
        },
    };

    const config = statusMap[status] || statusMap.UNKNOWN;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

// Metric Card Component
const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    change?: { value: number; isPositive: boolean };
    icon: React.ElementType;
    color: string;
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${change.isPositive ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                        {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change.value}%
                    </span>
                )}
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
            </div>
        </div>
    );
};

// TikTok Engagement Metric Card
const EngagementMetricCard = ({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{title}</p>
                </div>
            </div>
        </div>
    );
};

// Campaign Table Component
const CampaignTable = ({ campaigns }: { campaigns: Campaign[] }) => {
    const [sortField, setSortField] = useState<keyof Campaign>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        const aVal = a[sortField] ?? '';
        const bVal = b[sortField] ?? '';
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: keyof Campaign) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getTypeColor = (type: string) => {
        const typeMap: Record<string, string> = {
            VIDEO: 'bg-fuchsia-500/15 text-fuchsia-400',
            SPARK: 'bg-cyan-500/15 text-cyan-400',
        };
        return typeMap[type] || 'bg-slate-500/15 text-slate-400';
    };

    const getObjectiveIcon = (objective?: string) => {
        const objectiveMap: Record<string, JSX.Element> = {
            'Brand Awareness': <Sparkles className="w-3.5 h-3.5" />,
            'Conversions': <Target className="w-3.5 h-3.5" />,
            'Traffic': <ExternalLink className="w-3.5 h-3.5" />,
            'Engagement': <Heart className="w-3.5 h-3.5" />,
            'App Promotion': <Video className="w-3.5 h-3.5" />,
        };
        return objectiveMap[objective || ''] || <Target className="w-3.5 h-3.5" />;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Table Header with Controls */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Campaigns</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {campaigns.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Download className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('name')}>
                                Campaign
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('status')}>
                                Status
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('type')}>
                                Type
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Objective
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('impressions')}>
                                Impressions
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('clicks')}>
                                Clicks
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('ctr')}>
                                CTR
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('cost')}>
                                Cost
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('conversions')}>
                                Conversions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="w-8 h-8 text-slate-400" />
                                        <p>No campaigns found</p>
                                        <p className="text-xs">Try adjusting your search</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                            {campaign.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(campaign.type)}`}>
                                            {campaign.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                            {getObjectiveIcon(campaign.objective)}
                                            {campaign.objective || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {campaign.impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {campaign.clicks.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {campaign.ctr.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        ${campaign.cost.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {campaign.conversions.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Ad Groups Table Component
const AdGroupTable = ({ adGroups }: { adGroups: AdGroup[] }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ad Groups</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {adGroups.length}
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad Group</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video Views</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clicks</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CTR</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adGroups.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Target className="w-8 h-8 text-slate-400" />
                                        <p>No ad groups found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            adGroups.map((adGroup) => (
                                <tr key={adGroup.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                            {adGroup.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {adGroup.campaignName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={adGroup.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adGroup.videoViews?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adGroup.impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adGroup.clicks.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adGroup.ctr.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        ${adGroup.cost.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adGroup.conversions.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Ads Table Component
const AdTable = ({ ads }: { ads: Ad[] }) => {
    const [expandedAd, setExpandedAd] = useState<string | null>(null);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ads</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {ads.length}
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad Group</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video Views</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engagement</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Eng Rate</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clicks</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CTR</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <ExternalLink className="w-8 h-8 text-slate-400" />
                                        <p>No ads found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            ads.map((ad) => (
                                <tr key={ad.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                            {ad.name}
                                        </div>
                                        {ad.headline && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {ad.headline}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ad.type === 'SPARK' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-fuchsia-500/15 text-fuchsia-400'}`}>
                                            {ad.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {ad.adGroupName}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.videoViews?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.engagement?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.engagementRate?.toFixed(2) || 0}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.clicks.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.ctr.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        ${ad.cost.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="mt-3 space-y-2">
                            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="space-y-3">
                    <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        </div>
    );
};

// ============= WRAPPER COMPONENT WITH SUSPENSE =============

function DashboardContentWrapper() {
    const params = useParams();
    const searchParams = useSearchParams();
    const advertiserId = params.id;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState('LAST_30_DAYS');

    // Get query params
    const accessToken = searchParams.get('access_token');

    // Simulate API call
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // In production: 
                // const response = await fetch(`/api/tiktok/${advertiserId}/dashboard?dateRange=${selectedDateRange}&access_token=${accessToken}`);
                // const result = await response.json();

                await new Promise(resolve => setTimeout(resolve, 800));
                setData(MOCK_DATA);
            } catch (err) {
                setError('Failed to load TikTok dashboard data. Please try again.');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [advertiserId, selectedDateRange, accessToken]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <div className="max-w-7xl mx-auto">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        const emptyData: DashboardData = {
            campaigns: [],
            adGroups: [],
            ads: [],
            summary: {
                totalCampaigns: 0,
                totalAdGroups: 0,
                totalAds: 0,
                totalClicks: 0,
                totalImpressions: 0,
                totalCost: 0,
                totalConversions: 0,
                averageCtr: 0,
                averageCpc: 0,
                activeCampaigns: 0,
                pausedCampaigns: 0,
                totalVideoViews: 0,
                totalLikes: 0,
                totalShares: 0,
                totalComments: 0,
                totalEngagement: 0,
                averageEngagementRate: 0,
            },
        };
        return <DashboardContent data={emptyData} advertiserId={advertiserId as string} />;
    }

    return <DashboardContent data={data} advertiserId={advertiserId as string} />;
}

// ============= DASHBOARD CONTENT =============

function DashboardContent({ data, advertiserId }: { data: DashboardData; advertiserId: string }) {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'adgroups' | 'ads'>('campaigns');
    const [dateRange, setDateRange] = useState('LAST_30_DAYS');

    const { summary } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header with TikTok branding */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-fuchsia-500 via-slate-100 to-cyan-500 p-2 rounded-lg">
                                    <Music className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                        TikTok Ads Dashboard
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Advertiser: {advertiserId}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                                >
                                    <option value="LAST_7_DAYS">Last 7 days</option>
                                    <option value="LAST_30_DAYS">Last 30 days</option>
                                    <option value="LAST_90_DAYS">Last 90 days</option>
                                    <option value="THIS_MONTH">This month</option>
                                    <option value="LAST_MONTH">Last month</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Spend"
                        value={`$${summary.totalCost.toFixed(2)}`}
                        change={{ value: 12.5, isPositive: true }}
                        icon={DollarSign}
                        color="bg-emerald-500"
                    />
                    <MetricCard
                        title="Total Clicks"
                        value={summary.totalClicks.toLocaleString()}
                        change={{ value: 8.3, isPositive: true }}
                        icon={MousePointerClick}
                        color="bg-fuchsia-500"
                    />
                    <MetricCard
                        title="Total Video Views"
                        value={summary.totalVideoViews.toLocaleString()}
                        change={{ value: 18.7, isPositive: true }}
                        icon={Play}
                        color="bg-cyan-500"
                    />
                    <MetricCard
                        title="Total Conversions"
                        value={summary.totalConversions.toLocaleString()}
                        change={{ value: 15.2, isPositive: true }}
                        icon={Target}
                        color="bg-amber-500"
                    />
                </div>

                {/* TikTok Engagement Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <EngagementMetricCard
                        title="Likes"
                        value={summary.totalLikes}
                        icon={Heart}
                        color="bg-rose-500"
                    />
                    <EngagementMetricCard
                        title="Shares"
                        value={summary.totalShares}
                        icon={Share}
                        color="bg-blue-500"
                    />
                    <EngagementMetricCard
                        title="Comments"
                        value={summary.totalComments}
                        icon={MessageCircle}
                        color="bg-indigo-500"
                    />
                    <EngagementMetricCard
                        title="Total Engagement"
                        value={summary.totalEngagement}
                        icon={Sparkles}
                        color="bg-purple-500"
                    />
                    <EngagementMetricCard
                        title="Engagement Rate"
                        value={`${summary.averageEngagementRate.toFixed(2)}%`}
                        icon={TrendingUp}
                        color="bg-emerald-500"
                    />
                    <EngagementMetricCard
                        title="Avg CTR"
                        value={`${summary.averageCtr.toFixed(2)}%`}
                        icon={Percent}
                        color="bg-slate-500"
                    />
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Campaigns</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {summary.activeCampaigns}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Paused Campaigns</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {summary.pausedCampaigns}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Average CPC</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            ${summary.averageCpc.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Ad Groups</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {summary.totalAdGroups}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'campaigns'
                                    ? 'border-fuchsia-600 text-fuchsia-600 dark:text-fuchsia-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Campaigns
                            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data.campaigns.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('adgroups')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'adgroups'
                                    ? 'border-fuchsia-600 text-fuchsia-600 dark:text-fuchsia-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Ad Groups
                            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data.adGroups.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('ads')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ads'
                                    ? 'border-fuchsia-600 text-fuchsia-600 dark:text-fuchsia-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Ads
                            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data.ads.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'campaigns' && (
                        <CampaignTable campaigns={data.campaigns} />
                    )}
                    {activeTab === 'adgroups' && (
                        <AdGroupTable adGroups={data.adGroups} />
                    )}
                    {activeTab === 'ads' && (
                        <AdTable ads={data.ads} />
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-4 border-t border-slate-200 dark:border-slate-800">
                    Data is updated every 24 hours • Last sync: {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
}

// ============= MAIN PAGE EXPORT WITH SUSPENSE =============

export default function TikTokDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <div className="max-w-7xl mx-auto">
                    <LoadingSkeleton />
                </div>
            </div>
        }>
            <DashboardContentWrapper />
        </Suspense>
    );
}