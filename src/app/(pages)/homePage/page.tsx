'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
    KeyIcon,
    ArrowRightOnRectangleIcon,
    MusicalNoteIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
    // --- Original state, untouched ---
    const [mode, setMode] = useState<'manual' | 'login' | 'tiktok' | 'tiktok-login' | null>(null);
    const [adAccountId, setAdAccountId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const router = useRouter();

    // --- New state, additive only: powers the new TikTok manual-entry fields ---
    const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState('');
    const [tiktokAccessToken, setTiktokAccessToken] = useState('');

    const handleProceed = () => {
        console.log("App ID:", process.env.FB_APP_ID);
        if (mode === 'manual') {
            router.push(`/choice/${adAccountId}?access_token=${accessToken}`);
        } else if (mode === 'login') {
            // Redirect to Facebook login (you'll implement this separately)
            window.location.href = '/api/Facebook-login'; // adjust endpoint accordingly
        } else if (mode === 'tiktok') {
            // New branch, additive only — mirrors the 'manual' pattern above.
            // Adjust the destination route to match your TikTok flow.
            router.push(`/choice/tiktok/${tiktokAdvertiserId}?access_token=${tiktokAccessToken}`);
        } else if (mode === 'tiktok-login') {
            // New branch, additive only — mirrors the Meta 'login' pattern above.
            // Adjust the endpoint to match your actual TikTok OAuth route.
            window.location.href = '/api/tiktok-login';
        }
    };

    const isProceedDisabled =
        mode === null ||
        (mode === 'manual' && !adAccountId) ||
        (mode === 'tiktok' && (!tiktokAdvertiserId || !tiktokAccessToken));

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] bg-fuchsia-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300 tracking-wide uppercase mb-5">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                        Secure account connection
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        Social Media Management Portal
                    </h1>
                    <p className="mt-3 text-slate-400 text-sm">
                        Connect an ad account to get started managing campaigns.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Choose how you want to proceed
                    </p>

                    {/* Mode selector tiles */}
                    <p className="text-[10px] font-semibold text-blue-300/70 uppercase tracking-wider mb-2">
                        Meta
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        {/* Meta — manual */}
                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'manual'
                                    ? 'border-blue-400/60 bg-blue-500/10 ring-2 ring-blue-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
                            <input
                                type="radio"
                                name="mode"
                                value="manual"
                                checked={mode === 'manual'}
                                onChange={() => setMode('manual')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-500/15">
                                    <KeyIcon className="w-4.5 h-4.5 text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        Meta &mdash; Manual
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Enter Ad Account ID &amp; token
                                    </p>
                                </div>
                            </div>
                        </label>

                        {/* Meta — login */}
                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'login'
                                    ? 'border-blue-400/60 bg-blue-500/10 ring-2 ring-blue-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
                            <input
                                type="radio"
                                name="mode"
                                value="login"
                                checked={mode === 'login'}
                                onChange={() => setMode('login')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-500/15">
                                    <ArrowRightOnRectangleIcon className="w-4.5 h-4.5 text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        Meta &mdash; Login
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Connect with Facebook
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    <p className="text-[10px] font-semibold text-fuchsia-300/70 uppercase tracking-wider mb-2">
                        TikTok
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        {/* TikTok — manual */}
                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'tiktok'
                                    ? 'border-fuchsia-400/60 bg-fuchsia-500/10 ring-2 ring-fuchsia-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-slate-100 to-fuchsia-500" />
                            <input
                                type="radio"
                                name="mode"
                                value="tiktok"
                                checked={mode === 'tiktok'}
                                onChange={() => setMode('tiktok')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-fuchsia-500/15">
                                    <MusicalNoteIcon className="w-4.5 h-4.5 text-fuchsia-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        TikTok &mdash; Manual
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Enter Advertiser ID &amp; token
                                    </p>
                                </div>
                            </div>
                        </label>

                        {/* TikTok — login (new) */}
                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'tiktok-login'
                                    ? 'border-fuchsia-400/60 bg-fuchsia-500/10 ring-2 ring-fuchsia-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-slate-100 to-fuchsia-500" />
                            <input
                                type="radio"
                                name="mode"
                                value="tiktok-login"
                                checked={mode === 'tiktok-login'}
                                onChange={() => setMode('tiktok-login')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-fuchsia-500/15">
                                    <ArrowRightOnRectangleIcon className="w-4.5 h-4.5 text-fuchsia-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        TikTok &mdash; Login
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Connect with TikTok
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Meta manual fields */}
                    {mode === 'manual' && (
                        <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Ad Account ID
                                </label>
                                <input
                                    type="text"
                                    value={adAccountId}
                                    onChange={(e) => setAdAccountId(e.target.value)}
                                    placeholder="e.g. 1234567890"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Access Token
                                </label>
                                <input
                                    type="text"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="Enter Access Token"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* TikTok manual fields (new) */}
                    {mode === 'tiktok' && (
                        <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    TikTok Advertiser ID
                                </label>
                                <input
                                    type="text"
                                    value={tiktokAdvertiserId}
                                    onChange={(e) => setTiktokAdvertiserId(e.target.value)}
                                    placeholder="e.g. 7123456789012345"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    TikTok Access Token
                                </label>
                                <input
                                    type="text"
                                    value={tiktokAccessToken}
                                    onChange={(e) => setTiktokAccessToken(e.target.value)}
                                    placeholder="Enter TikTok Access Token"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Proceed button */}
                    <button
                        onClick={handleProceed}
                        disabled={isProceedDisabled}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 text-sm font-semibold rounded-xl shadow-lg shadow-black/20 hover:bg-slate-100 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 transition-all"
                    >
                        Proceed
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-center text-[11px] text-slate-500 mt-6">
                    Your credentials are used only to connect to your ad account and are never stored.
                </p>
            </div>
        </div>
    );
}