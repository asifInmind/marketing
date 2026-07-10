'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const conversionLocations = [
  'Website',
  'App',
  'Website and App',
  'Message Destinations',
  'Calls',
  'Website and Calls',
];

const performanceGoals = [
  'Maximize number of conversions',
  'Maximize value of conversions',
  'Maximise number of landing page views',
  'Maximise number of link clicks',
  'Maximise daily unique reach',
  'Maximise daily unique impressions',
];

const countries = [
  'United States','United Kingdom','Canada','Australia','India','Germany','France','Brazil','Japan','Mexico','Italy','Spain','Netherlands','Sweden','Norway','Switzerland','Ireland','New Zealand','South Africa','Singapore','United Arab Emirates','Saudi Arabia','Argentina','Chile','Colombia','Indonesia','Philippines','Malaysia','Thailand','Vietnam','South Korea','Turkey','Egypt','Pakistan','Bangladesh','Nigeria','Kenya','Poland','Czech Republic','Portugal','Belgium','Austria','Denmark','Finland','Greece','Israel','Romania','Hungary','Ukraine','Morocco',
];

const countryNameToCode: Record<string, string> = {'United States': 'US','United Kingdom': 'GB',Canada: 'CA',Australia: 'AU',India: 'IN',Germany: 'DE',France: 'FR',Brazil: 'BR',Japan: 'JP',Mexico: 'MX',Italy: 'IT',Spain: 'ES',Netherlands: 'NL',Sweden: 'SE',Norway: 'NO',Switzerland: 'CH',Ireland: 'IE','New Zealand': 'NZ','South Africa': 'ZA',Singapore: 'SG','United Arab Emirates': 'AE','Saudi Arabia': 'SA',Argentina: 'AR',Chile: 'CL',Colombia: 'CO',Indonesia: 'ID',Philippines: 'PH',Malaysia: 'MY',Thailand: 'TH',Vietnam: 'VN','South Korea': 'KR',Turkey: 'TR',Egypt: 'EG',Pakistan: 'PK',Bangladesh: 'BD',Nigeria: 'NG',Kenya: 'KE',Poland: 'PL','Czech Republic': 'CZ',Portugal: 'PT',Belgium: 'BE',Austria: 'AT',Denmark: 'DK',Finland: 'FI',Greece: 'GR',Israel: 'IL',Romania: 'RO',Hungary: 'HU',Ukraine: 'UA',Morocco: 'MA',
};

async function createAdSetRequest(adSetData: any, actId: string, accessToken: string) {
  const endpoint = `https://graph.facebook.com/v22.0/act_${actId}/adsets`;

  const payload = {
    name: adSetData.name,
    campaign_id: adSetData.campaign_id,
    daily_budget: adSetData.budget_type === 'Daily Budget' ? Number(adSetData.budget_amount) * 100 : undefined,
    lifetime_budget: adSetData.budget_type === 'Lifetime Budget' ? Number(adSetData.budget_amount) * 100 : undefined,
    optimization_goal: 'REACH',
    billing_event: 'IMPRESSIONS',
    start_time: adSetData.start_time,
    end_time: adSetData.end_time,
    targeting: adSetData.targeting,
    promoted_object: adSetData.promoted_object,
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    status: adSetData.status || 'PAUSED',
    access_token: accessToken,
  };

  Object.keys(payload).forEach(key => {
    if ((payload as Record<string, any>)[key] === undefined) {
      delete (payload as Record<string, any>)[key];
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  console.log('Creating Ad Set with payload:', payload);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.error("Full Facebook API error:", JSON.stringify(result, null, 2));

  if (!response.ok) throw new Error(result.error?.message || 'Failed to create ad set');
  console.log('Ad Set created successfully:', result);
  return result;
}

export default function CreateAdSet() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actId = searchParams.get('act_id')!;
  const accessToken = searchParams.get('access_token')!;
  const campaignParams = Object.fromEntries(searchParams.entries());

  const [datasets, setDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    conversion_location: 'Website',
    performance_goal: performanceGoals[0],
    dataset: '',
    cost_goal: '',
    dynamic_creative: false,
    budget_type: 'Daily Budget',
    budget_amount: '',
    start_date: '',
    start_time: '',
    end_date_enabled: false,
    end_days: '',
    end_date: '',
    end_time: '',
    audience_text: '',
    locations: [] as string[],
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    age_min: '',
    age_max: '',
    genders: [] as number[], // 1 for male, 2 for female
    interests: '',
  });

  const handleGenderChange = (genderId: number) => {
    setFormData(prev => {
      const hasGender = prev.genders.includes(genderId);
      return {
        ...prev,
        genders: hasGender ? prev.genders.filter(g => g !== genderId) : [...prev.genders, genderId],
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchPixels = async () => {
    try {
      const accountRes = await fetch(
        `https://graph.facebook.com/v22.0/act_${actId}?fields=business&access_token=${accessToken}`
      );
      const accountData = await accountRes.json();
      if (!accountRes.ok || !accountData.business?.id) {
        console.error('Failed to get business ID:', accountData);
        return;
      }

      const pixelRes = await fetch(
        `https://graph.facebook.com/v22.0/${accountData.business.id}/owned_pixels?fields=name&access_token=${accessToken}`
      );
      const pixelData = await pixelRes.json();

      if (!pixelRes.ok) {
        console.error('Failed to get pixels:', pixelData);
        return;
      }

      setDatasets(pixelData.data || []);
    } catch (err) {
      console.error('Unexpected error during pixel fetch:', err);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    fetchPixels().catch(console.error);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
      setShowLocationDropdown(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedDataset) {
      alert('Please select a dataset before continuing.');
      return;
    }

    const interestsArray = formData.interests
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .map(name => ({ name }));

    const payload: any = {
      name: formData.name,
      campaign_id: campaignParams.campaign_id,
      budget_type: formData.budget_type,
      budget_amount: formData.budget_amount,
      conversion_location: formData.conversion_location,
      performance_goal: formData.performance_goal,
      promoted_object: {
      pixel_id: selectedDataset,
      custom_event_type: 'OTHER',
      },
      start_time: formData.start_date
          ? new Date(`${formData.start_date}T${formData.start_time || '00:00'}`).toISOString()
          : undefined,
      end_time:
          formData.end_date_enabled && formData.end_date
          ? new Date(`${formData.end_date}T${formData.end_time || '23:59'}`).toISOString()
          : undefined,
      targeting: {
        geo_locations: { countries: formData.locations.map(c => countryNameToCode[c]) },
        age_min: formData.age_min ? Number(formData.age_min) : undefined,
        age_max: formData.age_max ? Number(formData.age_max) : undefined,
        flexible_spec: [
          {
          interests: interestsArray,
          },
        ],
        genders: formData.genders.length > 0 ? formData.genders : undefined,
      },
      bid_strategy: formData.bid_strategy,
      status: 'PAUSED',
    };
    try {
        const result = await createAdSetRequest(payload, actId, accessToken);
        alert('Ad Set created successfully with ID: ' + result.id);
        router.push(`/adCreative?act_id=${actId}&access_token=${accessToken}`);
    } catch (error: any) {
        alert('Failed to create Ad Set: ' + error.message);
    }};

  return (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-4">Create Facebook Ad Set</h1>
    <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="name">
            Ad Set Name
        </label>
        <input id="name" name="name" type="text" placeholder="Name your ad set" value={formData.name} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Conversion Location */}
      <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="conversion_location">
          Conversion Location
        </label>
        <select id="conversion_location" name="conversion_location" value={formData.conversion_location} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        >
          {conversionLocations.map(loc => (
            <option key={loc} value={loc} className='text-black'>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Performance Goal */}
      <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="performance_goal">
          Performance Goal
        </label>
        <select id="performance_goal" name="performance_goal" value={formData.performance_goal} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        >
          {performanceGoals.map(goal => (
            <option key={goal} value={goal} className='text-black'>
              {goal}
            </option>
          ))}
        </select>
      </div>

      {/* Dataset Selection */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Dataset (Pixel)</label>
        <select value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)} className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Select a Dataset --</option>
          {datasets.map(ds => (
            <option key={ds.id} value={ds.id} className='text-black'>
              {ds.name}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Type & Amount */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Budget Type</label>
        <div className='w-full justify-between flex space-x-5'>
            <select name="budget_type" value={formData.budget_type} onChange={handleChange} className="border px-3 py-2 rounded mb-2"
            >
              <option className='text-black'>Daily Budget</option>
              <option className='text-black'>Lifetime Budget</option>
            </select>

            <input name="budget_amount" type="number" placeholder="Budget Amount (USD)" value={formData.budget_amount} onChange={handleChange} className="w-full border px-3 py-1 rounded" min={1}
            />
        </div>
        
      </div>

      {/* Start Date and Time */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="start_date">
            Start Date
          </label>
          <input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="start_time">
            Start Time
          </label>
          <input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleChange} className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* End Date and Time (optional) */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input type="checkbox" name="end_date_enabled" checked={formData.end_date_enabled} onChange={handleChange} className="mr-2"
          />
          Set End Date and Time
        </label>

        {formData.end_date_enabled && (
          <div className="grid grid-cols-3 gap-4 mt-2">
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="border px-3 py-2 rounded"
            />
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="border px-3 py-2 rounded"
            />
          </div>
        )}
      </div>

      {/* Locations (multi-select dropdown with search) */}
      <div className="mb-4 relative" ref={locationDropdownRef}>
        <label className="block font-medium mb-1">Target Locations</label>
        <input type="text" placeholder="Add countries" onFocus={() => setShowLocationDropdown(true)} 
        onChange={e => {
                const val = e.target.value.toLowerCase();
                setShowLocationDropdown(true);
                // No filter state here, filtering done in render
            }}
            className="w-full border px-3 py-2 rounded mb-1"
        />

      {showLocationDropdown && (
          <div className="absolute z-10 w-full max-h-48 overflow-auto border bg-white rounded shadow">
          {countries
              .filter(c => !formData.locations.includes(c))
              .map(c => (
              <div
                  key={c}
                  className="cursor-pointer px-3 py-1 hover:bg-gray-100 text-black"
                  onClick={() => {
                      setFormData(prev => ({
                      ...prev,
                      locations: [...prev.locations, c],
                      }));
                      setShowLocationDropdown(false);
                  }}
              >
                  {c}
              </div>
              ))}
          </div>
      )}

      {/* Show selected locations */}
      <div className="flex flex-wrap mt-2 gap-2">
        {formData.locations.map(loc => (
          <span
            key={loc}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer"
            onClick={() =>
              setFormData(prev => ({
                ...prev,
                locations: prev.locations.filter(l => l !== loc),
              }))
            }
            title="Click to remove"
          >
            {loc} ×
          </span>
        ))}
      </div>
    </div>

    {/* Bid Strategy */}
    <div className="mb-4">
      <label className="block font-medium mb-1" htmlFor="bid_strategy">
        Bid Strategy
      </label>
      <select id="bid_strategy" name="bid_strategy" value={formData.bid_strategy} onChange={handleChange} className="w-full border px-3 py-2 rounded"
      >
        <option value="LOWEST_COST_WITHOUT_CAP" className='text-black'>Lowest Cost Without Cap</option>
        <option value="COST_CAP" className='text-black'>Cost Cap</option>
        <option value="BID_CAP" className='text-black'>Bid Cap</option>
        <option value="TARGET_COST" className='text-black'>Target Cost</option>
      </select>
    </div>

    {/* Age Range */}
    <div className="mb-4 grid grid-cols-2 gap-4">
      <div>
        <label className="block font-medium mb-1" htmlFor="age_min">
          Minimum Age
        </label>
        <input id="age_min" name="age_min" type="number" min={13} max={120} placeholder="13" value={formData.age_min} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="age_max">
          Maximum Age
        </label>
        <input id="age_max" name="age_max" type="number" min={13} max={120} placeholder="65" value={formData.age_max} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        />
      </div>
    </div>

    {/* Gender Selection */}
    <div className="mb-4">
      <label className="block font-medium mb-1">Gender</label>
      <div className="flex gap-6 items-center">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={formData.genders.includes(1)} onChange={() => handleGenderChange(1)} className="mr-2"
          />
          Male
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={formData.genders.includes(2)} onChange={() => handleGenderChange(2)} className="mr-2"
          />
          Female
        </label>
      </div>
    </div>

    {/* Interests */}
    <div className="mb-4">
      <label className="block font-medium mb-1" htmlFor="interests">
        Interests (comma separated)
      </label>
      <textarea id="interests" name="interests" rows={3} placeholder="e.g., Sports, Cooking, Technology" value={formData.interests} onChange={handleChange} className="w-full border px-3 py-2 rounded"
      />
    </div>

    {/* Continue Button */}
    <button
      onClick={handleContinue}
      className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
    >
      Continue
    </button>
  </div>
  );
}