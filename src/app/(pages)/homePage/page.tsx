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
    VideoCameraIcon, // For Google
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
    // --- Original Meta state, untouched ---
    const [mode, setMode] = useState<'manual' | 'login' | 'tiktok' | 'tiktok-login' | 'google' | 'google-login' | null>(null);
    const [adAccountId, setAdAccountId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const router = useRouter();

    // --- TikTok state ---
    const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState('');
    const [tiktokAccessToken, setTiktokAccessToken] = useState('');

    // --- Google state ---
    const [googleCustomerId, setGoogleCustomerId] = useState('');
    const [googleDeveloperToken, setGoogleDeveloperToken] = useState('');
    const [googleAccessToken, setGoogleAccessToken] = useState('');
    const [googleLoginCustomerId, setGoogleLoginCustomerId] = useState(''); // Optional MCC

    const handleProceed = () => {
    try {
        // --- Meta ---
        if (mode === 'manual') {
            if (!adAccountId || !accessToken) {
                throw new Error('Please fill in all Meta manual fields');
            }
            router.push(`/choice/${adAccountId}?access_token=${accessToken}`);
        } else if (mode === 'login') {
            window.location.href = '/api/Facebook-login';
        }
        // --- TikTok ---
        // else if (mode === 'tiktok') {
        //     if (!tiktokAdvertiserId || !tiktokAccessToken) {
        //         throw new Error('Please fill in all TikTok manual fields');
        //     }
        //     router.push(`/tiktok/choice/${tiktokAdvertiserId}?access_token=${tiktokAccessToken}`);
        // } else if (mode === 'tiktok-login') {
        //     window.location.href = '/api/tiktok-login';
        // }
        // --- Google ---
        // else if (mode === 'google') {
        //     if (!googleCustomerId || !googleDeveloperToken || !googleAccessToken) {
        //         throw new Error('Please fill in all Google manual fields');
        //     }
        //     const params = new URLSearchParams({
        //         developerToken: googleDeveloperToken,
        //         accessToken: googleAccessToken,
        //     });
        //     if (googleLoginCustomerId) {
        //         params.append('loginCustomerId', googleLoginCustomerId);
        //     }
        //     router.push(`/google/choice/${googleCustomerId}?${params.toString()}`);
        // } else if (mode === 'google-login') {
        //     window.location.href = '/api/google-login';
        // }
    } catch (error) {
        alert(error instanceof Error ? error.message : 'An error occurred');
        console.error('Navigation error:', error);
    }
};

    const isProceedDisabled = () => {
        if (mode === null) return true;
        
        // Meta manual
        if (mode === 'manual' && (!adAccountId || !accessToken)) return true;
        
        // TikTok manual
        // if (mode === 'tiktok' && (!tiktokAdvertiserId || !tiktokAccessToken)) return true;
        
        // Google manual
        // if (mode === 'google' && (!googleCustomerId || !googleDeveloperToken || !googleAccessToken)) return true;
        
        // Login modes don't need validation
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] bg-fuchsia-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-2xl">
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

                    {/* ========== META ========== */}
                    <p className="text-[10px] font-semibold text-blue-300/70 uppercase tracking-wider mb-2">
                        Meta Ads
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

                    {/* ========== TIKTOK ========== */}
                    {/* <p className="text-[10px] font-semibold text-fuchsia-300/70 uppercase tracking-wider mb-2">
                        TikTok Ads
                    </p>
                      
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
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
                    </div> */}

                    {/* ========== GOOGLE ========== */}
                    {/* <p className="text-[10px] font-semibold text-emerald-300/70 uppercase tracking-wider mb-2">
                        Google Ads
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                      
                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'google'
                                    ? 'border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                            <input
                                type="radio"
                                name="mode"
                                value="google"
                                checked={mode === 'google'}
                                onChange={() => setMode('google')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-500/15">
                                    <KeyIcon className="w-4.5 h-4.5 text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        Google &mdash; Manual
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Enter Customer ID &amp; tokens
                                    </p>
                                </div>
                            </div>
                        </label>

                        <label
                            className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                                mode === 'google-login'
                                    ? 'border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-400/30'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                            <input
                                type="radio"
                                name="mode"
                                value="google-login"
                                checked={mode === 'google-login'}
                                onChange={() => setMode('google-login')}
                                className="sr-only"
                            />
                            <div className="p-4 flex flex-col items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-500/15">
                                    <ArrowRightOnRectangleIcon className="w-4.5 h-4.5 text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        Google &mdash; Login
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        Connect with Google
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div> */}

                    {/* ========== MANUAL FIELDS ========== */}

                    {/* Meta manual fields - UNTOUCHED */}
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

                    {/* TikTok manual fields */}
                    {/* {mode === 'tiktok' && (
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
                    )} */}

                    {/* Google manual fields */}
                    {/* {mode === 'google' && (
                        <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Google Ads Customer ID <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={googleCustomerId}
                                    onChange={(e) => {
                                        // Remove hyphens for clean input
                                        const value = e.target.value.replace(/-/g, '');
                                        if (/^\d*$/.test(value)) {
                                            setGoogleCustomerId(value);
                                        }
                                    }}
                                    placeholder="e.g. 1234567890"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Enter only numbers (hyphens will be removed automatically)
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Developer Token <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={googleDeveloperToken}
                                    onChange={(e) => setGoogleDeveloperToken(e.target.value)}
                                    placeholder="Enter your Google Ads Developer Token"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    OAuth Access Token <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={googleAccessToken}
                                    onChange={(e) => setGoogleAccessToken(e.target.value)}
                                    placeholder="Enter your OAuth Access Token"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Login Customer ID <span className="text-slate-500">(Optional - for MCC)</span>
                                </label>
                                <input
                                    type="text"
                                    value={googleLoginCustomerId}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/-/g, '');
                                        if (/^\d*$/.test(value) || value === '') {
                                            setGoogleLoginCustomerId(value);
                                        }
                                    }}
                                    placeholder="e.g. 0987654321"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Required if using a Manager Account (MCC)
                                </p>
                            </div>
                        </div>
                    )} */}

                    {/* ========== PROCEED BUTTON ========== */}
                    <button
                        onClick={handleProceed}
                        disabled={isProceedDisabled()}
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