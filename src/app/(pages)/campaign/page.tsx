'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createCampaign } from '../../../services/Api';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

const buyingTypes = [
  { label: 'Auction', value: 'AUCTION' },
  { label: 'Reserved', value: 'RESERVED' }
];

const allObjectiveGroups = [
  'Awareness',
  'Traffic',
  'Engagement',
  'Leads',
  'App promotion',
  'Sales'
];

const reservedOnlyGroups = [
  'Awareness',
  'Engagement'
];

const objectiveCategoryMap: Record<string, string> = {
    Awareness: 'BRAND_AWARENESS',
    Traffic: 'LINK_CLICKS',
    Engagement: 'POST_ENGAGEMENT',
    Leads: 'LEAD_GENERATION',
    App_promotion: 'APP_INSTALLS',
    Sales: 'OUTCOME_SALES'
};

// ✅ This component contains the actual logic with useSearchParams
function CreateCampaignContent() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const actId = searchParams.get('act_id');
  const [isAbTest, setIsAbTest] = useState(false);
  const [specialCategories, setSpecialCategories] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [country, setCountry] = useState('');
  const router = useRouter();

  const countries: any[] = [  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'Germany',
  'France',
  'Brazil',
  'Japan',
  'Mexico',
  'Italy',
  'Spain',
  'Netherlands',
  'Sweden',
  'Norway',
  'Switzerland',
  'Ireland',
  'New Zealand',
  'South Africa',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'Argentina',
  'Chile',
  'Colombia',
  'Indonesia',
  'Philippines',
  'Malaysia',
  'Thailand',
  'Vietnam',
  'South Korea',
  'Turkey',
  'Egypt',
  'Pakistan',
  'Bangladesh',
  'Nigeria',
  'Kenya',
  'Poland',
  'Czech Republic',
  'Portugal',
  'Belgium',
  'Austria',
  'Denmark',
  'Finland',
  'Greece',
  'Israel',
  'Romania',
  'Hungary',
  'Ukraine',
  'Morocco',];

  const [formData, setFormData] = useState({
    name: '',
    buying_type: 'AUCTION',
    objective: ''
  });

  const allSpecialCategories = [
    { label: "Financial products and services", value: "FINANCIAL_PRODUCTS_SERVICES" },
    { label: "Employment", value: "EMPLOYMENT" },
    { label: "Housing", value: "HOUSING" },
    { label: "Social issues, elections or politics", value: "ISSUES_ELECTIONS_POLITICS" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleObjectiveSelect = (group: string) => {
    setFormData(prev => ({ ...prev, objective: group }));
  };

  const objectiveGroups = formData.buying_type === 'RESERVED' ? reservedOnlyGroups : allObjectiveGroups;

  const handleConfirm = async () => {
    if (!formData.name || !formData.objective) {
      alert('Please enter campaign name and select an objective.');
      return;
    }

    if (!accessToken || !actId) {
      alert('Missing access token or account ID.');
      return;
    }

    const mappedObjective = objectiveCategoryMap[formData.objective];
    if (!mappedObjective) {
      alert('Invalid objective selected.');
      return;
    }

    const payload = {
      name: formData.name,
      objective: mappedObjective,
      status: 'PAUSED',
      special_ad_categories: specialCategories.length > 0
        ? specialCategories
        : ['NONE']
    };

    try {
      console.log('Payload sent to Meta:', {
        ...payload,
        buying_type: formData.buying_type,
        objective_group_selected: formData.objective,
        mapped_objective: mappedObjective,
        country,
        is_ab_test: isAbTest
      });
      const response = await createCampaign(payload, accessToken, actId);
      console.log('Campaign created:', response);

      if (response.id) {
        router.push(`/adset?campaign_id=${response.id}&access_token=${accessToken}&act_id=${actId}`);
      } else {
        alert('Failed to create campaign. Check console.');
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
      alert('Error: ' + (err as Error).message);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Campaign Name <span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="name"
          placeholder="e.g. My Campaign"
          className="w-full border px-3 py-2 rounded"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Buying Type</label>
        <select
          name="buying_type"
          className="w-full border px-3 py-2 rounded text-black bg-white"
          value={formData.buying_type}
          onChange={handleChange}
        >
          {buyingTypes.map(bt => (
            <option key={bt.value} value={bt.value}>{bt.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Available Campaign Objectives <span className='text-red-500'>*</span></label>
        <div className="grid grid-cols-2 gap-2">
          {objectiveGroups.map(group => (
            <button
              key={group}
              type="button"
              className={`p-3 rounded text-center font-medium border transition-all ${
                formData.objective === group
                  ? 'bg-amber-100 text-black'
                  : 'bg-white text-black border-gray-300'
              }`}
              onClick={() => handleObjectiveSelect(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center justify-between space-x-2 font-medium">
          <span>Set up A/B Test</span>
          <input
            type="checkbox"
            checked={isAbTest}
            onChange={() => setIsAbTest(prev => !prev)}
            className="w-4 h-4"
          />
        </label>
        <p>
          Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience.
        </p>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Special Ad Categories</label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(prev => !prev)}
            className="w-full border px-3 py-2 rounded text-left bg-white text-black flex justify-between items-center"
          >
            {specialCategories.length > 0
              ? allSpecialCategories
                  .filter(cat => specialCategories.includes(cat.value))
                  .map(cat => cat.label)
                  .join(', ')
              : 'Select Categories'}
            {showDropdown ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow p-2 max-h-60 overflow-y-auto">
              {allSpecialCategories.map(({ label, value }) => {
                const isDisabled = value === 'ISSUES_ELECTIONS_POLITICS';
                const isChecked = specialCategories.includes(value);

                return (
                  <label
                    key={value}
                    className={`flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 text-black ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{isDisabled ? `${label} (Not Allowed)` : label}</span>
                    <input
                      type="checkbox"
                      value={value}
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        const value = e.target.value;
                        setSpecialCategories((prev) =>
                          prev.includes(value)
                            ? prev.filter((c) => c !== value)
                            : [...prev, value]
                        );
                        setCountry('');
                      }}
                      className="w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {specialCategories.some(cat =>
            ['FINANCIAL_PRODUCTS_SERVICES', 'EMPLOYMENT', 'HOUSING'].includes(cat)
        ) && (
          <div className="mt-4">
            <label className="block mb-1 font-medium">Select Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border px-3 py-2 rounded text-black bg-white"
            >
              <option value="" className='text-black'>Select Country</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button
        className="bg-amber-100 text-black px-6 py-2 rounded hover:scale-105 duration-200 disabled:opacity-50 cursor-pointer"
        onClick={handleConfirm}
        disabled={!formData.name || !formData.objective}
      >
        Continue
      </button>
    </div>
  );
}

// ✅ Default export with Suspense boundary
export default function CreateCampaign() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaign creator...</p>
          </div>
        </div>
      }
    >
      <CreateCampaignContent />
    </Suspense>
  );
}