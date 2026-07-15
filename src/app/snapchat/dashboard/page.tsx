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
    Camera,
    Sparkles,
    Clock,
    Play,
    Heart,
    Share,
    MessageCircle,
    Zap,
    BarChart,
    PieChart,
    LineChart,
} from 'lucide-react';

// ============= TYPES =============
interface Campaign {
    id: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'UNKNOWN';
    objective: string;
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
    videoViews?: number;
    viewCompletion?: number;
    swipeRate?: number;
}

interface AdSquad {
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
    optimizationGoal?: string;
    bidAmount?: number;
    dailyBudget?: number;
    lifetimeBudget?: number;
}

interface Ad {
    id: string;
    name: string;
    type: string;
    adSquadName: string;
    campaignName: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    headline?: string;
    description?: string;
    finalUrl?: string;
    videoViews?: number;
    viewCompletion?: number;
    swipeRate?: number;
    engagement?: number;
}

interface DashboardData {
    campaigns: Campaign[];
    adSquads: AdSquad[];
    ads: Ad[];
    summary: {
        totalCampaigns: number;
        totalAdSquads: number;
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
        totalViewCompletions: number;
        averageViewCompletion: number;
        totalSwipes: number;
        averageSwipeRate: number;
    };
}

// ============= MOCK DATA =============
const MOCK_DATA: DashboardData = {
    campaigns: [
        {
            id: '1',
            name: 'Snapchat Brand Awareness - Summer 2026',
            status: 'ACTIVE',
            objective: 'BRAND_AWARENESS',
            type: 'SNAP_ADS',
            clicks: 15456,
            impressions: 756789,
            cost: 15450.75,
            ctr: 2.04,
            cpc: 1.00,
            conversions: 334,
            conversionValue: 6678.90,
            budget: 6000,
            startDate: '2026-06-01',
            endDate: '2026-08-31',
            videoViews: 456789,
            viewCompletion: 123456,
            swipeRate: 2.04,
        },
        {
            id: '2',
            name: 'Snapchat App Install - Gaming Campaign',
            status: 'ACTIVE',
            objective: 'APP_INSTALL',
            type: 'SNAP_ADS',
            clicks: 12456,
            impressions: 423456,
            cost: 12450.25,
            ctr: 2.94,
            cpc: 1.00,
            conversions: 289,
            conversionValue: 7345.67,
            budget: 5000,
            startDate: '2026-05-15',
            videoViews: 234567,
            viewCompletion: 89012,
            swipeRate: 2.94,
        },
        {
            id: '3',
            name: 'Snapchat Web Conversion - E-commerce',
            status: 'PAUSED',
            objective: 'WEB_CONVERSION',
            type: 'SNAP_ADS',
            clicks: 7890,
            impressions: 287654,
            cost: 8901.50,
            ctr: 2.74,
            cpc: 1.13,
            conversions: 156,
            conversionValue: 4567.89,
            budget: 3000,
            startDate: '2026-04-01',
            endDate: '2026-06-30',
            videoViews: 187654,
            viewCompletion: 56789,
            swipeRate: 2.74,
        },
        {
            id: '4',
            name: 'Snapchat Video Views - Influencer Collab',
            status: 'ACTIVE',
            objective: 'VIDEO_VIEW',
            type: 'SNAP_ADS',
            clicks: 23456,
            impressions: 634567,
            cost: 15678.90,
            ctr: 3.69,
            cpc: 0.67,
            conversions: 445,
            conversionValue: 11876.54,
            budget: 8000,
            startDate: '2026-03-01',
            videoViews: 567890,
            viewCompletion: 234567,
            swipeRate: 3.69,
        },
        {
            id: '5',
            name: 'Snapchat Lens Campaign - AR Experience',
            status: 'DELETED',
            objective: 'BRAND_AWARENESS',
            type: 'LENS',
            clicks: 5678,
            impressions: 187890,
            cost: 5678.12,
            ctr: 3.02,
            cpc: 1.00,
            conversions: 178,
            conversionValue: 5345.67,
            budget: 4000,
            startDate: '2026-02-01',
            endDate: '2026-04-30',
            videoViews: 145678,
            viewCompletion: 34567,
            swipeRate: 3.02,
        },
    ],
    adSquads: [
        {
            id: '1',
            name: 'Ad Squad - Brand Story',
            campaignName: 'Snapchat Brand Awareness - Summer 2026',
            status: 'ACTIVE',
            clicks: 8678,
            impressions: 434567,
            cost: 8678.90,
            ctr: 2.00,
            conversions: 198,
            videoViews: 234567,
            optimizationGoal: 'IMPRESSIONS',
            bidAmount: 2.50,
            dailyBudget: 1000,
            lifetimeBudget: 30000,
        },
        {
            id: '2',
            name: 'Ad Squad - Product Showcase',
            campaignName: 'Snapchat Brand Awareness - Summer 2026',
            status: 'ACTIVE',
            clicks: 5456,
            impressions: 223456,
            cost: 5456.78,
            ctr: 2.44,
            conversions: 167,
            videoViews: 123456,
            optimizationGoal: 'SWIPES',
            bidAmount: 3.00,
            dailyBudget: 800,
            lifetimeBudget: 24000,
        },
        {
            id: '3',
            name: 'Ad Squad - Retargeting',
            campaignName: 'Snapchat App Install - Gaming Campaign',
            status: 'ACTIVE',
            clicks: 4345,
            impressions: 187654,
            cost: 4345.67,
            ctr: 2.31,
            conversions: 145,
            videoViews: 98765,
            optimizationGoal: 'APP_INSTALLS',
            bidAmount: 4.00,
            dailyBudget: 500,
            lifetimeBudget: 15000,
        },
        {
            id: '4',
            name: 'Ad Squad - High Value Keywords',
            campaignName: 'Snapchat Web Conversion - E-commerce',
            status: 'PAUSED',
            clicks: 4567,
            impressions: 143210,
            cost: 4567.89,
            ctr: 3.19,
            conversions: 89,
            videoViews: 76543,
            optimizationGoal: 'WEB_CONVERSION',
            bidAmount: 5.00,
            dailyBudget: 300,
            lifetimeBudget: 9000,
        },
        {
            id: '5',
            name: 'Ad Squad - Viral Content',
            campaignName: 'Snapchat Video Views - Influencer Collab',
            status: 'ACTIVE',
            clicks: 12345,
            impressions: 323456,
            cost: 8901.23,
            ctr: 3.82,
            conversions: 234,
            videoViews: 345678,
            optimizationGoal: 'VIDEO_VIEWS',
            bidAmount: 2.00,
            dailyBudget: 1500,
            lifetimeBudget: 45000,
        },
    ],
    ads: [
        {
            id: '1',
            name: 'Snap Ad - Brand Story Video',
            type: 'SNAP_ADS',
            adSquadName: 'Ad Squad - Brand Story',
            campaignName: 'Snapchat Brand Awareness - Summer 2026',
            clicks: 5456,
            impressions: 223456,
            cost: 5456.78,
            ctr: 2.44,
            headline: 'Discover Our Brand Story',
            description: 'Watch the full story on Snapchat',
            finalUrl: 'https://example.com/brand-story',
            videoViews: 123456,
            viewCompletion: 34567,
            swipeRate: 2.44,
            engagement: 18146,
        },
        {
            id: '2',
            name: 'Snap Ad - Product Demo',
            type: 'SNAP_ADS',
            adSquadName: 'Ad Squad - Product Showcase',
            campaignName: 'Snapchat Brand Awareness - Summer 2026',
            clicks: 3345,
            impressions: 187654,
            cost: 3345.67,
            ctr: 1.78,
            headline: 'See Our Products in Action',
            description: 'Watch our product demo on Snapchat',
            finalUrl: 'https://example.com/product-demo',
            videoViews: 98765,
            viewCompletion: 23456,
            swipeRate: 1.78,
            engagement: 12480,
        },
        {
            id: '3',
            name: 'Snap Ad - App Install',
            type: 'SNAP_ADS',
            adSquadName: 'Ad Squad - Retargeting',
            campaignName: 'Snapchat App Install - Gaming Campaign',
            clicks: 2345,
            impressions: 98765,
            cost: 2345.56,
            ctr: 2.38,
            headline: 'Download Our Game Today!',
            description: 'Join millions of players',
            finalUrl: 'https://example.com/app-install',
            videoViews: 56789,
            viewCompletion: 12345,
            swipeRate: 2.38,
            engagement: 6590,
        },
        {
            id: '4',
            name: 'Snap Ad - Web Conversion',
            type: 'SNAP_ADS',
            adSquadName: 'Ad Squad - High Value Keywords',
            campaignName: 'Snapchat Web Conversion - E-commerce',
            status: 'PAUSED',
            clicks: 3456,
            impressions: 123456,
            cost: 3456.78,
            ctr: 2.80,
            headline: 'Shop Our Collection',
            description: 'Limited time offers',
            finalUrl: 'https://example.com/shop',
            videoViews: 45678,
            viewCompletion: 9876,
            swipeRate: 2.80,
            engagement: 8024,
        },
        {
            id: '5',
            name: 'Snap Ad - Influencer Collab',
            type: 'SNAP_ADS',
            adSquadName: 'Ad Squad - Viral Content',
            campaignName: 'Snapchat Video Views - Influencer Collab',
            clicks: 6789,
            impressions: 234567,
            cost: 4567.89,
            ctr: 2.89,
            headline: 'Check Out This Viral Trend!',
            description: 'Join the challenge',
            finalUrl: 'https://example.com/challenge',
            videoViews: 234567,
            viewCompletion: 67890,
            swipeRate: 2.89,
            engagement: 37024,
        },
        {
            id: '6',
            name: 'Snap Lens - AR Filter',
            type: 'LENS',
            adSquadName: 'Ad Squad - Viral Content',
            campaignName: 'Snapchat Video Views - Influencer Collab',
            clicks: 5678,
            impressions: 167890,
            cost: 4567.89,
            ctr: 3.38,
            headline: 'Try Our AR Filter!',
            description: 'Snap and share',
            finalUrl: 'https://example.com/lens',
            videoViews: 123456,
            viewCompletion: 34567,
            swipeRate: 3.38,
            engagement: 22590,
        },
    ],
    summary: {
        totalCampaigns: 5,
        totalAdSquads: 5,
        totalAds: 6,
        totalClicks: 67890,
        totalImpressions: 2345678,
        totalCost: 56789.12,
        totalConversions: 867,
        averageCtr: 2.89,
        averageCpc: 0.84,
        activeCampaigns: 3,
        pausedCampaigns: 1,
        totalVideoViews: 1678901,
        totalViewCompletions: 456789,
        averageViewCompletion: 27.2,
        totalSwipes: 67890,
        averageSwipeRate: 2.89,
    },
};

// ============= COMPONENTS =============

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { color: string; icon: JSX.Element; label: string }> = {
        ACTIVE: {
            color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            icon: <PlayCircle className="w-3.5 h-3.5" />,
            label: 'Active',
        },
        PAUSED: {
            color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            icon: <PauseCircle className="w-3.5 h-3.5" />,
            label: 'Paused',
        },
        DELETED: {
            color: 'bg-red-500/15 text-red-400 border-red-500/30',
            icon: <StopCircle className="w-3.5 h-3.5" />,
            label: 'Deleted',
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

// Snapchat Engagement Metric Card
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
        campaign.objective.toLowerCase().includes(searchTerm.toLowerCase())
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
            SNAP_ADS: 'bg-yellow-500/15 text-yellow-400',
            LENS: 'bg-purple-500/15 text-purple-400',
            FILTER: 'bg-cyan-500/15 text-cyan-400',
        };
        return typeMap[type] || 'bg-slate-500/15 text-slate-400';
    };

    const getObjectiveIcon = (objective: string) => {
        const objectiveMap: Record<string, JSX.Element> = {
            BRAND_AWARENESS: <Sparkles className="w-3.5 h-3.5" />,
            APP_INSTALL: <Target className="w-3.5 h-3.5" />,
            WEB_CONVERSION: <ExternalLink className="w-3.5 h-3.5" />,
            VIDEO_VIEW: <Play className="w-3.5 h-3.5" />,
        };
        return objectiveMap[objective] || <Target className="w-3.5 h-3.5" />;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                            className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-slate-900 dark:text-white placeholder:text-slate-400"
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
                                Swipes
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('ctr')}>
                                Swipe Rate
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('cost')}>
                                Spend
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
                                            {campaign.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                            {getObjectiveIcon(campaign.objective)}
                                            {campaign.objective.replace('_', ' ')}
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

// Ad Squads Table Component
const AdSquadTable = ({ adSquads }: { adSquads: AdSquad[] }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ad Squads</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {adSquads.length}
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad Squad</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Optimization</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video Views</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Swipes</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Swipe Rate</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spend</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adSquads.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Target className="w-8 h-8 text-slate-400" />
                                        <p>No ad squads found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            adSquads.map((adSquad) => (
                                <tr key={adSquad.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                            {adSquad.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {adSquad.campaignName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={adSquad.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {adSquad.optimizationGoal?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adSquad.videoViews?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adSquad.impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adSquad.clicks.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adSquad.ctr.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        ${adSquad.cost.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {adSquad.conversions.toLocaleString()}
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
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad Squad</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video Views</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">View Completion</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Swipe Rate</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Swipes</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ad.type === 'LENS' ? 'bg-purple-500/15 text-purple-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                            {ad.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {ad.adSquadName}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.videoViews?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.viewCompletion?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.swipeRate?.toFixed(2) || 0}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {ad.clicks.toLocaleString()}
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
    const accountId = params.id;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState('LAST_30_DAYS');

    // Get query params
    const accessToken = searchParams.get('access_token');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // In production: 
                // const response = await fetch(`/api/snapchat/${accountId}/dashboard?dateRange=${selectedDateRange}&access_token=${accessToken}`);
                // const result = await response.json();

                await new Promise(resolve => setTimeout(resolve, 800));
                setData(MOCK_DATA);
            } catch (err) {
                setError('Failed to load Snapchat dashboard data. Please try again.');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accountId, selectedDateRange, accessToken]);

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
                        className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
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
            adSquads: [],
            ads: [],
            summary: {
                totalCampaigns: 0,
                totalAdSquads: 0,
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
                totalViewCompletions: 0,
                averageViewCompletion: 0,
                totalSwipes: 0,
                averageSwipeRate: 0,
            },
        };
        return <DashboardContent data={emptyData} accountId={accountId as string} />;
    }

    return <DashboardContent data={data} accountId={accountId as string} />;
}

// ============= DASHBOARD CONTENT =============

function DashboardContent({ data, accountId }: { data: DashboardData; accountId: string }) {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'adsquads' | 'ads'>('campaigns');
    const [dateRange, setDateRange] = useState('LAST_30_DAYS');

    const { summary } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header with Snapchat branding */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-2 rounded-lg">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Snapchat Ads Dashboard
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
                        title="Total Swipes"
                        value={summary.totalClicks.toLocaleString()}
                        change={{ value: 8.3, isPositive: true }}
                        icon={MousePointerClick}
                        color="bg-yellow-500"
                    />
                    <MetricCard
                        title="Video Views"
                        value={summary.totalVideoViews.toLocaleString()}
                        change={{ value: 18.7, isPositive: true }}
                        icon={Play}
                        color="bg-amber-500"
                    />
                    <MetricCard
                        title="Conversions"
                        value={summary.totalConversions.toLocaleString()}
                        change={{ value: 15.2, isPositive: true }}
                        icon={Target}
                        color="bg-orange-500"
                    />
                </div>

                {/* Snapchat Engagement Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <EngagementMetricCard
                        title="View Completion"
                        value={`${summary.averageViewCompletion.toFixed(1)}%`}
                        icon={Video}
                        color="bg-blue-500"
                    />
                    <EngagementMetricCard
                        title="Swipe Rate"
                        value={`${summary.averageSwipeRate.toFixed(2)}%`}
                        icon={BarChart}
                        color="bg-yellow-500"
                    />
                    <EngagementMetricCard
                        title="Total Impressions"
                        value={summary.totalImpressions}
                        icon={Eye}
                        color="bg-purple-500"
                    />
                    <EngagementMetricCard
                        title="Active Campaigns"
                        value={summary.activeCampaigns}
                        icon={Sparkles}
                        color="bg-emerald-500"
                    />
                    <EngagementMetricCard
                        title="Avg CPC"
                        value={`$${summary.averageCpc.toFixed(2)}`}
                        icon={TrendingUp}
                        color="bg-cyan-500"
                    />
                    <EngagementMetricCard
                        title="Total Ad Squads"
                        value={summary.totalAdSquads}
                        icon={Users}
                        color="bg-indigo-500"
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Video Views</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {summary.totalVideoViews.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Swipes</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {summary.totalSwipes.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'campaigns'
                                    ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Campaigns
                            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data.campaigns.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('adsquads')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'adsquads'
                                    ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Ad Squads
                            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data.adSquads.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('ads')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ads'
                                    ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400'
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
                    {activeTab === 'adsquads' && (
                        <AdSquadTable adSquads={data.adSquads} />
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

export default function SnapchatDashboardPage() {
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