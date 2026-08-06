'use client';

import React, { useState } from 'react';
import { ShoppingBag, X, Key, AlertCircle, RefreshCw } from 'lucide-react';

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
  onConnectManual,
  loading
}: ShopifyConnectModalProps) {
  const [apiToken, setApiToken] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanToken = apiToken.trim();
    if (!cleanToken) {
      setValidationError('Please enter your inMind Authorization Token.');
      return;
    }

    // Call connect manual with "OMS" as the stubbed URL, and cleanToken as the token
    onConnectManual('OMS', cleanToken);
    onClose();
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
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Connect Shopify via inMind</h3>
              <p className="text-xs text-slate-500">Sync store orders and inventory metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Description */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please enter your brand's inMind Authorization Token to synchronize your Shopify store product inventory and revenue metrics with your active Meta Ads campaigns.
          </div>

          {/* Token Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> inMind Authorization Token
            </label>
            <textarea
              placeholder="Paste your inMind JWT token here..."
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="w-full h-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/50 transition-all text-sm resize-none"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect inMind Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
