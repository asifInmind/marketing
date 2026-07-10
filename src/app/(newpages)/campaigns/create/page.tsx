// app/campaigns/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createNewCampaign } from '../../../../services/campaignApi';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const buyingTypes = [
  { label: 'Auction', value: 'AUCTION' },
  { label: 'Reserved', value: 'RESERVED' },
];

const allObjectiveGroups = ['Awareness', 'Traffic', 'Engagement', 'Leads', 'App promotion', 'Sales'];
const reservedOnlyGroups = ['Awareness', 'Engagement'];

const objectiveCategoryMap: Record<string, string> = {
  Awareness: 'OUTCOME_AWARENESS',
  Traffic: 'OUTCOME_TRAFFIC',
  Engagement: 'OUTCOME_ENGAGEMENT',
  Leads: 'OUTCOME_LEADS',
  'App promotion': 'OUTCOME_APP_PROMOTION',
  Sales: 'OUTCOME_SALES',
};

const allSpecialCategories = [
  { label: 'Financial products and services', value: 'FINANCIAL_PRODUCTS_SERVICES' },
  { label: 'Employment', value: 'EMPLOYMENT' },
  { label: 'Housing', value: 'HOUSING' },
  { label: 'Social issues, elections or politics', value: 'ISSUES_ELECTIONS_POLITICS' },
];

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France',
  'Brazil', 'Japan', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway',
  'Switzerland', 'Ireland', 'New Zealand', 'South Africa', 'Singapore', 'United Arab Emirates',
  'Saudi Arabia', 'Argentina', 'Chile', 'Colombia', 'Indonesia', 'Philippines', 'Malaysia',
  'Thailand', 'Vietnam', 'South Korea', 'Turkey', 'Egypt', 'Pakistan', 'Bangladesh', 'Nigeria',
  'Kenya', 'Poland', 'Czech Republic', 'Portugal', 'Belgium', 'Austria', 'Denmark', 'Finland',
  'Greece', 'Israel', 'Romania', 'Hungary', 'Ukraine', 'Morocco',
];

export default function CreateCampaign() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const actId = searchParams.get('act_id');
  const router = useRouter();

  const [isAbTest, setIsAbTest] = useState(false);
  const [specialCategories, setSpecialCategories] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    buying_type: 'AUCTION',
    objective: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleObjectiveSelect = (group: string) => {
    setFormData((prev) => ({ ...prev, objective: group }));
  };

  const objectiveGroups = formData.buying_type === 'RESERVED' ? reservedOnlyGroups : allObjectiveGroups;

  const [showSuccess, setShowSuccess] = useState(false);

const handleConfirm = async () => {
  if (!formData.name || !formData.objective) return;

  if (!accessToken || !actId) {
    setSubmitError('Missing access token or account ID. Please go back and reconnect your account.');
    return;
  }

  const mappedObjective = objectiveCategoryMap[formData.objective];
  if (!mappedObjective) {
    setSubmitError('Invalid objective selected.');
    return;
  }

  const payload = {
    name: formData.name,
    objective: mappedObjective,
    status: 'PAUSED',
    buying_type: formData.buying_type,
    special_ad_categories: specialCategories.length > 0 ? specialCategories : ['NONE'],
    is_adset_budget_sharing_enabled: false,
  };

  setSubmitting(true);
  setSubmitError(null);

  try {
    const response = await createNewCampaign(payload, accessToken, actId);

    if (response.id) {
      setShowSuccess(true); // ✅ show success state

      // strip "act_" prefix to match your dashboard's URL pattern
      const cleanActId = actId.replace('act_', '');

      setTimeout(() => {
        router.push(`/choice/${cleanActId}?access_token=${accessToken}`);
      }, 1500); // brief pause so the user sees the confirmation
    } else {
      setSubmitError('Campaign creation did not return an ID. Check console for details.');
    }
  } catch (err) {
    setSubmitError((err as Error).message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
        {showSuccess && (
  <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-900">Campaign created</p>
      <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
    </div>
  </div>
)}
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <MegaphoneIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Campaign</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set up the top level of your ad structure.</p>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5">
            <span>{submitError}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-7">
          {/* Campaign name */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-800">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Summer Sale 2026"
              className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Buying type */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-800">Buying Type</label>
            <div className="grid grid-cols-2 gap-2">
              {buyingTypes.map((bt) => {
                const isSelected = formData.buying_type === bt.value;
                return (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, buying_type: bt.value }))}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {bt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              Campaign Objective <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {objectiveGroups.map((group) => {
                const isSelected = formData.objective === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => handleObjectiveSelect(group)}
                    className={`relative p-3 rounded-xl text-sm text-center font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <CheckIcon className="w-3.5 h-3.5 text-blue-600 absolute top-2 right-2" />
                    )}
                    {group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* A/B test toggle */}
          <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">Set up A/B Test</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Compare versions of your campaign across separate audience groups to see what performs best.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAbTest((prev) => !prev)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                isAbTest ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAbTest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Special categories */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">Special Ad Categories</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-left bg-white text-sm text-gray-900 flex justify-between items-center hover:border-gray-300 transition-colors"
              >
                <span className={specialCategories.length === 0 ? 'text-gray-400' : ''}>
                  {specialCategories.length > 0
                    ? allSpecialCategories
                        .filter((cat) => specialCategories.includes(cat.value))
                        .map((cat) => cat.label)
                        .join(', ')
                    : 'Select categories (optional)'}
                </span>
                {showDropdown ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute z-10 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 max-h-60 overflow-y-auto">
                  {allSpecialCategories.map(({ label, value }) => {
                    const isDisabled = value === 'ISSUES_ELECTIONS_POLITICS';
                    const isChecked = specialCategories.includes(value);

                    return (
                      <label
                        key={value}
                        className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-sm transition-colors ${
                          isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <span className="text-gray-800">{isDisabled ? `${label} (Not Allowed)` : label}</span>
                        <input
                          type="checkbox"
                          value={value}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (isDisabled) return;
                            const val = e.target.value;
                            setSpecialCategories((prev) =>
                              prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
                            );
                            setCountry('');
                          }}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {specialCategories.some((cat) =>
              ['FINANCIAL_PRODUCTS_SERVICES', 'EMPLOYMENT', 'HOUSING'].includes(cat)
            ) && (
              <div className="mt-3.5">
                <label className="block mb-1.5 text-sm font-semibold text-gray-800">Select Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 active:scale-[0.98] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center gap-2"
            onClick={handleConfirm}
            disabled={!formData.name || !formData.objective || submitting}
          >
            {submitting && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {submitting ? 'Creating...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}