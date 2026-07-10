'use client';
import React, { useState, useEffect } from 'react';
import AdCreativeModal from '../../../components/modal/AdCreativeModal';
import { useRouter } from 'next/navigation';

export default function CreateAd() {
  const [formData, setFormData] = useState({
    facebookPage: '',
    instagram_actor_id: '',
    name: '',
    image_hash: '',
    partnership: '',
    adSetupType: 'Create Ad',
    creativeSource: 'Manual Upload',
    format: 'Single image or video',
    multiAdvertiser: true,
    destinationUrl: '',
    creativeType: 'select ad creative',
    thumbnail: '',
    displayLabel: '',
    creativeUrl: '',
    primaryText: '',
    headline: '',
    description: '',
    callToAction: 'BUY_NOW',
    campaignId: '',
    adsetId: '',
    status: "PAUSED"
  });

  interface Campaign {
    id: string;
    name: string;
  }
  interface Adset {
    id: string;
    name: string;
  }
  interface FacebookPage {
    id: string;
    name: string;
    instagram_business_account?: {
      id: string;
      username: string;
    };
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [actId, setActId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // const [selectedCreativeType, setSelectedCreativeType] = useState('');
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<{ images: any[]; videos: any[] }>({ images: [], videos: [] });
  const [creativeType, setCreativeType] = useState<'image' | 'video' | null>(null);
  const [creativePreview, setCreativePreview] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adsets, setAdsets] = useState<Adset[]>([]);
  const router = useRouter();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const act_id = urlParams.get('act_id');
    const access_token = urlParams.get('access_token');
    if (act_id && access_token) {
      setActId(act_id);
      setAccessToken(access_token);
    } else {
      setError('Missing act_id or access_token in the URL');
    }
  }, []);

  useEffect(() => {
    if (!actId || !accessToken) return;

    const fetchBusinessPages = async () => {
      try {
        const accountRes = await fetch(`https://graph.facebook.com/v22.0/act_${actId}?fields=business&access_token=${accessToken}`);
        const businessData = await accountRes.json();
        if (!businessData.business?.id) throw new Error("No business ID found.");
        const businessId = businessData.business.id;

        const fetchFromMeta = async (endpoint: string) => {
          const res = await fetch(`https://graph.facebook.com/v22.0/${endpoint}&access_token=${accessToken}`);
          if (!res.ok) throw new Error('Fetch failed');
          return res.json();
        };

        const fetchData = async () => {
          try {
            const [campaignsData, adsetsData] = await Promise.all([
              fetchFromMeta(`act_${actId}/campaigns?fields=id,name`),
              fetchFromMeta(`act_${actId}/adsets?fields=id,name`),
            ]);
            setCampaigns(campaignsData.data || []);
            setAdsets(adsetsData.data || []);
          } catch (err: any) {
            setError(err.message || 'Failed to fetch campaigns or adsets');
          }
        };

        fetchData();

        // Fetch Facebook Pages with linked Instagram accounts
        const pagesRes = await fetch(
          `https://graph.facebook.com/v22.0/${businessId}/owned_pages?fields=name,instagram_business_account{id,username}&access_token=${accessToken}`
        );
        const pagesData = await pagesRes.json();
        if (pagesData.data) setPages(pagesData.data);
        else setError('No pages found for this business.');
      } catch (err) {
        console.error('Error fetching business or pages:', err);
        setError('Failed to load business or pages.');
      }
    };

    fetch(`https://graph.facebook.com/v22.0/act_${actId}?fields=adimages{url},advideos{source}&access_token=${accessToken}`)
      .then(res => res.json())
      .then(data => {
        const images = data.adimages?.data || [];
        const videos = data.advideos?.data || [];
        setMediaAssets({ images, videos });
      })
      .catch(err => console.error('Failed to fetch media:', err));

    fetchBusinessPages();

  }, [actId, accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      const isChecked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreativeTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, creativeType: value}));
    const type = value === 'image ad' ? 'image' : value === 'video ad' ? 'video' : null;
    
    if (type){
      setCreativeType(type);
      setShowCreativeModal(true);
    }
  };
  const handlePublish = async () => {
    if (!actId || !accessToken) {
      setError('Missing actId or accessToken');
      return;
    }

    if (!formData.instagram_actor_id && formData.facebookPage) {
      setError('Selected Facebook Page does not have a linked Instagram account');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload ={
          name: formData.name || 'Ad Creative',
          object_story_spec: {
            page_id: formData.facebookPage,
            // instagram_actor_id: formData.instagram_actor_id,
            link_data: {
              image_hash: formData.image_hash,
              // image_url: formData.creativeUrl,
              link: formData.destinationUrl,
              message: formData.primaryText,
              name: formData.headline,
              description: formData.description,
              caption: formData.displayLabel,
              call_to_action: {
                type: formData.callToAction.toUpperCase().replace(' ', '_'),
                value: {
                  link: sourceUrl,
                },
              },
            },
          },
          access_token: accessToken,
        }
        console.log(payload, "payload")
      // Step 1: Create Ad Creative
      const creativeRes = await fetch(`https://graph.facebook.com/v22.0/act_${actId}/adcreatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const creativeJson = await creativeRes.json();
      console.log(creativeJson, "creative");
      if (!creativeRes.ok) throw new Error(creativeJson.error?.message || 'Failed to create ad creative');
      const creativeId = creativeJson.id;

      // Step 2: Create Ad
      const adRes = await fetch(`https://graph.facebook.com/v22.0/act_${actId}/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          adset_id: adsets.find((a) => a.name === formData.adsetId)?.id,
          creative: { creative_id: creativeId },
          status: 'PAUSED',
          access_token: accessToken,
        }),
      });
      
      const adJson = await adRes.json();
      if (!adRes.ok) throw new Error(adJson.error?.message || 'Failed to create ad');

      alert('Ad published successfully!');
      console.log('Ad created:', adJson);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
}, [formData]);


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Create New Ad</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    <div>
      <label className="block font-medium mb-1" >Select Campaign</label>
      <select
        name="campaignId"
        value={formData.campaignId || ''}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, campaignId: e.target.value }))
        }
        className="w-full border px-3 py-2 rounded"
      >
        <option value="" className='text-black'>Select a campaign</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id} className='text-black'>{c.name}</option>
        ))}
      </select>
    </div>

      <div>
        <label className="block font-medium mb-1">Select Ad Set</label>
        <select
          name="adsetId"
          value={formData.adsetId || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, adsetId: e.target.value }))
          }
          className="w-full border px-3 py-2 rounded"
        >
          <option value="" className='text-black'>Select an ad set</option>
          {adsets.map((a) => (
            <option key={a.id} value={a.id} className='text-black'>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Facebook Page Selector */}
      <div>
        <label className="block font-medium mb-1">
          Facebook Page <span className="text-red-500">*</span>
        </label>
        <select
          name="facebookPage"
          value={formData.facebookPage}
          onChange={(e) => {
            const selectedPageId = e.target.value;
            const selectedPage = pages.find((page) => page.id === selectedPageId);
            const instagramId = selectedPage?.instagram_business_account?.id || '';

            setFormData((prev) => ({
              ...prev,
              facebookPage: selectedPageId,
              instagram_actor_id: '', // Clear Instagram ID until user selects
            }));

            if (!instagramId) {
              setError('Selected Facebook Page does not have a linked Instagram account');
            } else {
              setError(null);
            }
          }}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="" className='text-black'>Select a page</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id} className='text-black'>
              {page.name}
            </option>
          ))}
        </select>
      </div>

      {/* Instagram Page Selector */}
      <div>
        <label className="block font-medium mb-1">
          Instagram Page <span className="text-red-500">*</span>
        </label>
        <select
          name="instagram_actor_id"
          value={formData.instagram_actor_id}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              instagram_actor_id: e.target.value,
            }))
          }
          className="w-full border px-3 py-2 rounded"
        >
          <option value="" className='text-black'>Select Instagram account</option>
          {(() => {
            const selectedPage = pages.find((page) => page.id === formData.facebookPage);
            const insta = selectedPage?.instagram_business_account;
            return insta ? (
              <option value={insta.id} className='text-black'>{insta.username}</option>
            ) : null;
          })()}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Ad Name <span className='text-red-500'>*</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Partnership</label>
        <input type="text" name="partnership" value={formData.partnership} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Ad Setup</label>
        <select name="adSetupType" value={formData.adSetupType} onChange={handleChange} className="w-full border px-3 py-2 rounded"
        >
          <option>Create Ad</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Creative Source</label>
        <div>
          <input type="radio" checked readOnly /> Manual Upload
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Format</label>
        <div className="space-y-2">
          {['Flexible', 'Single image or video', 'Carousel', 'Collection'].map((f) => (
            <label key={f} className="flex items-center space-x-2">
              <input type="radio" name="format" value={f} checked={formData.format === f} onChange={handleChange}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 rounded border">
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="multiAdvertiser" checked={formData.multiAdvertiser} onChange={handleChange}
          />
          <span>Multi-advertiser ads</span>
        </label>
        <p className="text-sm mt-1 text-gray-600">
          Your ads can appear alongside other ads in the same ad unit...
        </p>
      </div>

      <div>
        <label className="block font-medium mb-1">Website URL *</label>
        <input type="text" name="destinationUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Creative Type</label>
        <select name="creativeType" value={formData.creativeType} onChange={handleCreativeTypeSelect} className="w-full border px-3 py-2 rounded"
        > 
          <option value="select ad type" className='text-black'>Select ad creative</option>
          <option value="image ad" className='text-black'>Image Ad</option>
          <option value="video ad" className='text-black'>Video Ad</option>
        </select>
      </div>
      
      {showCreativeModal && (
        <AdCreativeModal isOpen={showCreativeModal} onClose={() => setShowCreativeModal(false)}
          onDone={async (data: any) => {
            setCreativePreview({
              ...data,
              selectedImage: data.selectedImage,
              creativeType,
            });
            setFormData((prev) => ({
              ...prev,
              image_hash: data.hash,
              thumbnail: data.thumbnail,
              displayLabel: data.displayLabel,
              creativeUrl: data.selectedImage,
              primaryText: data.primaryText,
              headline: data.headline,
              description: data.description,
              callToAction: data.callToAction,
              destinationUrl: sourceUrl,
            }));
            console.log("form Data",formData)
            setShowCreativeModal(false);
          }}
          actId={actId} accessToken={accessToken} creativeType={creativeType} initialUrl={sourceUrl}
        />
      )}
      {creativePreview && (
      <div className="border rounded-lg p-4 shadow-md bg-white w-96">
        <h3 className="text-lg font-bold text-black mb-2">Ad Preview</h3>
          <div className="mb-3">
            {creativePreview.creativeType === 'image' ? (
              <img src={creativePreview.selectedImage} alt="Ad Creative" className="w-full h-96 object-cover rounded" />
            ) : (
              <video src={creativePreview.selectedImage} controls className="w-full h-auto rounded" />
            )}
          </div>
            {creativePreview.displayLabel && (
              <div className="text-sm text-gray-600 mb-1">{creativePreview.displayLabel}</div>
            )}
            <div className="text-base text-fuchsia-500 font-semibold">{creativePreview.headline}</div>
            <div className="text-sm text-gray-700">{creativePreview.primaryText}</div>
            {/* <div className="text-sm text-gray-500 ">{creativePreview.description}</div> */}

            {creativePreview.callToAction && (
              <button className="mt-3 inline-block px-4 py-2 bg-blue-600 cursor-pointer text-white rounded" onClick={() => router.push(sourceUrl)}>
                {creativePreview.callToAction}
              </button>
          )}
        </div>
      )}
      <button className="bg-amber-500 text-white px-6 py-2 rounded hover:scale-105 duration-200" onClick={handlePublish}>
        Publish
      </button>
    </div>
  );
}
