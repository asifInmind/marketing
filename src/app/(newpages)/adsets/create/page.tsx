'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  TagIcon,
  FolderIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// ✅ This component contains the actual logic with useSearchParams
function CreateAdSetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const actId = searchParams.get('act_id');

  // State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: 'My Ad Set',
    campaign_id: '',
    daily_budget: 300,
    country: 'US',
    status: 'PAUSED',
    start_date: '',
    start_time: '00:00',
    end_date: '',
    end_time: '23:59',
    has_end_date: false,
    page_id: '',
  });

  // Fetch campaigns and pages
  useEffect(() => {
    if (!accessToken || !actId) {
      setError('Missing credentials');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        // Fetch campaigns
        const campaignsRes = await fetch(
          `https://graph.facebook.com/v25.0/${actId}/campaigns?fields=name,status,objective&access_token=${accessToken}`
        );
        const campaignsJson = await campaignsRes.json();
        if (!campaignsJson.error) {
          setCampaigns(campaignsJson.data || []);
          if (campaignsJson.data?.length > 0) {
            setFormData(prev => ({ ...prev, campaign_id: campaignsJson.data[0].id }));
          }
        }

        // Fetch pages
        const pagesRes = await fetch(
          `https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category&access_token=${accessToken}`
        );
        const pagesJson = await pagesRes.json();
        if (!pagesJson.error) {
          setPages(pagesJson.data || []);
          if (pagesJson.data?.length > 0) {
            setFormData(prev => ({ ...prev, page_id: pagesJson.data[0].id }));
          }
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [accessToken, actId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.campaign_id) {
      setError('Please select a campaign');
      return;
    }
    if (!formData.page_id) {
      setError('Please select a Facebook Page');
      return;
    }
    if (formData.daily_budget < 250) {
      setError('Daily budget must be at least PKR 250');
      return;
    }

    // Build start_time
    let startTimeISO = undefined;
    if (formData.start_date) {
      startTimeISO = `${formData.start_date}T${formData.start_time}:00+0000`;
    }

    // Build end_time
    let endTimeISO = undefined;
    if (formData.has_end_date && formData.end_date) {
      endTimeISO = `${formData.end_date}T${formData.end_time}:00+0000`;
    }

    // Convert budget to cents
    const budgetInCents = formData.daily_budget * 100;

    // ✅ SIMPLE PAYLOAD - ALWAYS WORKS
    const payload = {
      name: formData.name,
      campaign_id: formData.campaign_id,
      daily_budget: budgetInCents,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'REACH', // ← ALWAYS REACH
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: {
        geo_locations: {
          countries: [formData.country]
        }
      },
      promoted_object: {
        page_id: formData.page_id
      },
      status: formData.status,
    };

    // Add optional fields
    if (startTimeISO) (payload as any).start_time = startTimeISO;
    if (endTimeISO) (payload as any).end_time = endTimeISO;

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${actId}/adsets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();

      if (json.error) {
        throw new Error(json.error.error_user_msg || json.error.message);
      }

      setResult(json);
      setSuccess(true);
      
      setTimeout(() => {
        const cleanActId = actId?.startsWith('act_') ? actId.replace('act_', '') : actId;
        router.push(`/choice/${cleanActId}?access_token=${accessToken}`);
      }, 3000);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Ad Set</h1>
            <p className="text-sm text-gray-500">Configure your ad set settings</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Ad Set Created Successfully!</p>
                <p className="text-sm text-green-600">ID: {result?.id}</p>
                <p className="text-sm text-green-600">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          
          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MegaphoneIcon className="w-4 h-4 inline mr-1" />
              Campaign <span className="text-red-500">*</span>
            </label>
            <select
              name="campaign_id"
              value={formData.campaign_id}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
            >
              <option value="">Select a campaign</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.status})
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Info: Always uses REACH */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                Using <strong>REACH</strong> optimization goal (works for ALL campaigns)
              </p>
            </div>
          </div>

          {/* Ad Set Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <TagIcon className="w-4 h-4 inline mr-1" />
              Ad Set Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Ad Set"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Page Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FolderIcon className="w-4 h-4 inline mr-1" />
              Facebook Page <span className="text-red-500">*</span>
            </label>
            <select
              name="page_id"
              value={formData.page_id}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
            >
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name} ({page.category || 'Page'})
                </option>
              ))}
            </select>
          </div>

          {/* Daily Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
              Daily Budget (PKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-medium">PKR</span>
              <input
                type="number"
                name="daily_budget"
                value={formData.daily_budget}
                onChange={handleChange}
                min="250"
                step="50"
                className="w-full pl-14 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum: PKR 250</p>
          </div>

          {/* Target Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <GlobeAltIcon className="w-4 h-4 inline mr-1" />
              Target Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
            >
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="BR">Brazil</option>
              <option value="JP">Japan</option>
              <option value="CN">China</option>
              <option value="RU">Russia</option>
              <option value="ZA">South Africa</option>
              <option value="NG">Nigeria</option>
              <option value="EG">Egypt</option>
              <option value="SA">Saudi Arabia</option>
              <option value="AE">United Arab Emirates</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="PH">Philippines</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PAUSED"
                  checked={formData.status === 'PAUSED'}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Paused (Draft)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={formData.status === 'ACTIVE'}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Active (Live)</span>
              </label>
            </div>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* End Date - Optional */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="has_end_date"
                checked={formData.has_end_date}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Set End Date (Optional)</span>
            </label>
            
            {formData.has_end_date && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:bg-gray-400 rounded-lg transition-colors shadow-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Ad Set'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>✅ Using <strong>REACH</strong> optimization - works for ALL campaign types</p>
          <p className="mt-0.5">Budget: PKR {formData.daily_budget} ({formData.daily_budget * 100} cents)</p>
        </div>
      </div>
    </div>
  );
}

// ✅ Default export with Suspense boundary
export default function CreateAdSetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-orange-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ad set creator...</p>
          </div>
        </div>
      }
    >
      <CreateAdSetContent />
    </Suspense>
  );
}