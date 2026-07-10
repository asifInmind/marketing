'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

async function createAdRequest(payload: any, accessToken: string, actId: string) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v25.0/${cleanActId}/ads`;

  console.log('📤 Sending Ad payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (json.error) {
    console.error('❌ Meta API Error:', json.error);
    throw new Error(json.error.error_user_msg || json.error.message || 'Failed to create ad');
  }

  console.log('✅ Ad created:', json);
  return json;
}

export default function CreateAdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const actId = searchParams.get('act_id');

  // Architecture States
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadingPages, setLoadingPages] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Cascading Dropdown States
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [availableAdSets, setAvailableAdSets] = useState<any[]>([]);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string>('');

  // Ad set context, fetched once an ad set is selected, so we can warn about mismatches
  const [adSetOptimizationGoal, setAdSetOptimizationGoal] = useState<string>('');
  const [adSetDestinationType, setAdSetDestinationType] = useState<string>('');

  // Form Content States
  const [adName, setAdName] = useState<string>('');
  const [status, setStatus] = useState<string>('PAUSED'); // Safe draft state default

  // Creative States
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [primaryText, setPrimaryText] = useState<string>('Check out our latest updates!');
  const [description, setDescription] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [callToAction, setCallToAction] = useState<string>('LEARN_MORE');

  const ctaOptions = [
    'LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_TRAVEL',
    'CONTACT_US', 'GET_QUOTE', 'SUBSCRIBE', 'APPLY_NOW', 'GET_OFFER',
  ];

  // Fetch the nested campaign -> adset hierarchy, plus pages for creative attribution
  useEffect(() => {
    if (!accessToken || !actId) {
      setError('Missing context parameters (access_token or act_id).');
      setLoadingData(false);
      return;
    }

    async function fetchAccountHierarchy() {
      try {
        // Fetch campaigns and their nested adsets in a single call
        const fields = 'name,status,adsets{name,status,optimization_goal,destination_type,promoted_object}';
        const url = `https://graph.facebook.com/v25.0/${actId}/campaigns?fields=${fields}&access_token=${accessToken}`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.error) throw new Error(json.error.message);

        setHierarchy(json.data || []);

        // Fetch pages needed for the ad creative's object_story_spec
        setLoadingPages(true);
        const pagesUrl = `https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category&access_token=${accessToken}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesJson = await pagesRes.json();
        if (!pagesJson.error) {
          setPages(pagesJson.data || []);
        }
        setLoadingPages(false);
      } catch (err) {
        setError(`Failed to load account assets: ${(err as Error).message}`);
      } finally {
        setLoadingData(false);
      }
    }

    fetchAccountHierarchy();
  }, [accessToken, actId]);

  // Handle Cascading Filter: Triggered when the first dropdown (Campaign) changes
  useEffect(() => {
    if (!selectedCampaignId) {
      setAvailableAdSets([]);
      setSelectedAdSetId('');
      return;
    }

    const matchedCampaign = hierarchy.find((c) => c.id === selectedCampaignId);
    const adSetsData = matchedCampaign?.adsets?.data || [];

    setAvailableAdSets(adSetsData);
    setSelectedAdSetId('');
    setAdSetOptimizationGoal('');
    setAdSetDestinationType('');
  }, [selectedCampaignId, hierarchy]);

  // Pull context off the selected ad set so we can surface useful info/warnings
  useEffect(() => {
    if (!selectedAdSetId) {
      setAdSetOptimizationGoal('');
      setAdSetDestinationType('');
      return;
    }

    const matchedAdSet = availableAdSets.find((a) => a.id === selectedAdSetId);
    setAdSetOptimizationGoal(matchedAdSet?.optimization_goal || '');
    setAdSetDestinationType(matchedAdSet?.destination_type || '');

    // Pre-select the page tied to this ad set's promoted_object, if present
    const promotedPageId = matchedAdSet?.promoted_object?.page_id;
    if (promotedPageId) {
      setSelectedPageId(promotedPageId);
    }
  }, [selectedAdSetId, availableAdSets]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAdSetId || !adName) {
      setError('Please select an ad set and provide an ad name.');
      return;
    }

    if (!selectedPageId) {
      setError('Please select a Facebook Page to run this ad from.');
      return;
    }

    if (!linkUrl) {
      setError('Please enter a destination URL for the ad.');
      return;
    }

    if (!headline) {
      setError('Please enter a headline for the ad creative.');
      return;
    }

    if (!accessToken || !actId) {
      setError('Missing access token or account ID. Please go back and reconnect your account.');
      return;
    }

    setSubmitting(true);

    try {
      // Build a proper object_story_spec-based creative instead of a mock image_hash.
      // This is what Meta actually needs to render a link ad.
      const creative = {
        object_story_spec: {
          page_id: selectedPageId,
          link_data: {
            link: linkUrl,
            message: primaryText,
            name: headline,
            description: description || undefined,
            call_to_action: {
              type: callToAction,
              value: { link: linkUrl },
            },
          },
        },
      };

      const payload = {
        name: adName,
        adset_id: selectedAdSetId,
        status: status,
        creative: JSON.stringify(creative),
      };

      await createAdRequest(payload, accessToken, actId);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard?access_token=${accessToken}`);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-100 p-6 md:p-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-purple-50 to-white">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-purple-100 rounded-lg text-gray-600 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Ad</h1>
            <p className="text-xs text-gray-500 mt-0.5">Deploy creative items under a specific ad set tier</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium">
              ✅ Success! Ad created successfully. Redirecting to dashboard...
            </div>
          )}

          {/* 1. Dropdown 1: Choose Parent Campaign */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Step 1: Select Campaign <span className="text-red-500">*</span>
            </label>
            {loadingData ? (
              <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 animate-pulse">
                Mapping marketing account hierarchies...
              </div>
            ) : (
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">-- Choose a Campaign --</option>
                {hierarchy.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Dropdown 2: Cascading Ad Set Choice */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Step 2: Select Ad Set <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAdSetId}
              onChange={(e) => setSelectedAdSetId(e.target.value)}
              disabled={!selectedCampaignId || availableAdSets.length === 0}
              required
              className="w-full p-2.5 bg-white border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="">
                {!selectedCampaignId
                  ? '-- Select a Campaign First --'
                  : availableAdSets.length === 0
                  ? '-- No Ad Sets Available --'
                  : '-- Choose an Ad Set --'}
              </option>
              {availableAdSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name} ({set.status})
                </option>
              ))}
            </select>

            {selectedCampaignId && availableAdSets.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium">
                This campaign has no ad sets yet. Please create an ad set for this campaign before building ads.
              </p>
            )}

            {adSetOptimizationGoal && (
              <p className="text-[11px] text-blue-600 mt-1.5">
                🎯 Ad set optimization goal: <span className="font-semibold">{adSetOptimizationGoal.replace(/_/g, ' ')}</span>
              </p>
            )}
          </div>

          {/* 3. Ad Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Ad Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={adName}
              onChange={(e) => setAdName(e.target.value)}
              placeholder="e.g., Summer Promo - Image Var 2"
              required
              disabled={!selectedAdSetId}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          {/* 4. Facebook Page (creative source) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Run Ad From Page <span className="text-red-500">*</span>
            </label>
            {loadingPages ? (
              <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 animate-pulse">
                Loading your pages...
              </div>
            ) : (
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                disabled={!selectedAdSetId}
                required
                className="w-full p-2.5 bg-white border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">-- Select a Page --</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} ({page.category || 'Page'})
                  </option>
                ))}
              </select>
            )}
            {pages.length === 0 && !loadingPages && (
              <p className="text-xs text-amber-600 mt-1.5">⚠️ No pages found. Create a Facebook Page first.</p>
            )}
          </div>

          {/* 5. Creative fields */}
          <div className="space-y-3.5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Ad Creative</p>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.yourwebsite.com/landing-page"
                disabled={!selectedAdSetId}
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., 50% Off This Weekend Only"
                maxLength={40}
                disabled={!selectedAdSetId}
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">{headline.length}/40 characters</p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Primary Text</label>
              <textarea
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                placeholder="Check out our latest updates!"
                rows={2}
                disabled={!selectedAdSetId}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shown below the headline on some placements"
                disabled={!selectedAdSetId}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Call to Action</label>
              <select
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                disabled={!selectedAdSetId}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                {ctaOptions.map((cta) => (
                  <option key={cta} value={cta}>
                    {cta.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-amber-600">
              ⚠️ No image is attached in this creative. Meta may reject placements requiring media —
              add an image_hash to link_data once you wire up image upload.
            </p>
          </div>

          {/* 6. Status Group */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Ad Delivery Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="adStatus"
                  value="PAUSED"
                  checked={status === 'PAUSED'}
                  onChange={() => setStatus('PAUSED')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Paused (Draft Mode)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="adStatus"
                  value="ACTIVE"
                  checked={status === 'ACTIVE'}
                  onChange={() => setStatus('ACTIVE')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Active (Live)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedAdSetId}
              className="px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md shadow-sm transition-all active:scale-[0.98]"
            >
              {submitting ? 'Creating...' : 'Create Ad'}
            </button>
          </div>

          {/* Help section */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-medium text-yellow-800">💡 Having trouble?</p>
            <p className="text-[11px] text-yellow-700 mt-1">
              Ads inherit their delivery rules from the ad set's optimization goal — if this ad
              rejects, double check the destination URL and page match what that ad set's
              promoted object expects.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}