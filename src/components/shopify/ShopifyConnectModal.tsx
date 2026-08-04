'use client';

import React, { useState } from 'react';
import { ShoppingBag, X, Key, Globe, AlertCircle, RefreshCw } from 'lucide-react';

interface ShopifyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectOauth: (shopUrl: string) => void;
  onConnectManual: (shopUrl: string, apiToken: string) => void;
  loading: boolean;
}

export function ShopifyConnectModal({
  isOpen,
  onClose,
  onConnectOauth,
  onConnectManual,
  loading
}: ShopifyConnectModalProps) {
  const [shopUrl, setShopUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [activeTab, setActiveTab] = useState<'oauth' | 'manual'>('oauth');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanShop = shopUrl.replace(/^(https?:\/\/)?/, '').trim();
    if (!cleanShop) {
      setValidationError('Please enter your Shopify store URL.');
      return;
    }

    if (!cleanShop.endsWith('.myshopify.com') && !cleanShop.includes('.')) {
      setValidationError('Please enter a valid store URL (e.g. store.myshopify.com).');
      return;
    }

    if (activeTab === 'oauth') {
      onConnectOauth(cleanShop);
    } else {
      if (!apiToken.trim()) {
        setValidationError('Please enter your Admin API Access Token.');
        return;
      }
      if (!apiToken.startsWith('shpat_')) {
        setValidationError('Shopify access tokens typically start with "shpat_".');
        return;
      }
      onConnectManual(cleanShop, apiToken.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Connect Shopify Store</h3>
              <p className="text-xs text-slate-500">Sync orders and inventory metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-1 bg-slate-50/30 dark:bg-slate-950/10">
          {/* <button
            onClick={() => { setActiveTab('oauth'); setValidationError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'oauth'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            OAuth (Automatic)
          </button> */}
          <button
            onClick={() => { setActiveTab('manual'); setValidationError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'manual'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
          >
            Developer API Token
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Shopify Store URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Shopify Store URL
            </label>
            <input
              type="text"
              placeholder="my-cool-store.myshopify.com"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/50 transition-all text-sm"
              required
            />
          </div>

          {/* OAuth Description vs Manual Input */}
          {activeTab === 'oauth' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-500 leading-relaxed">
              Clicking connect will redirect you to Shopify to authorize and install this dashboard app in your store. Once completed, we will redirect you back here automatically.
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Admin API Access Token
                </label>
                <input
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/50 transition-all text-sm"
                  required={activeTab === 'manual'}
                />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Generate this token in your Shopify Admin under: **Settings &gt; Apps and sales channels &gt; Develop apps &gt; Create an app**. Assign the `read_products`, `read_orders`, and `read_inventory` scopes, install the app, and paste the Access Token here.
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                activeTab === 'oauth' ? 'Connect Automatically' : 'Connect Manually'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
