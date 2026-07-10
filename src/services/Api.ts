const buildFormData = (data) => {
    const formData = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
        }
    }
    return formData;
    };

    export const createCampaign = async (data, accessToken, adAccountId) => {
    const url = `https://graph.facebook.com/v22.0/act_${adAccountId}/campaigns`;
    const formData = buildFormData({ ...data, access_token: accessToken });

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        console.error('Campaign creation failed:', result.error);
        throw new Error(result.error?.message || 'Campaign creation failed');
    }
    return result;
    };

    export const createAdSet = async (data, accessToken, adAccountId) => {
    const url = `https://graph.facebook.com/v22.0/act_${adAccountId}/adsets`;
    const formData = buildFormData({ ...data, access_token: accessToken });

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        console.error('Ad set creation failed:', result.error);
        throw new Error(result.error?.message || 'Ad set creation failed');
    }
    return result;
    };

    export const createAdCreative = async (data, accessToken, adAccountId) => {
    const url = `https://graph.facebook.com/v22.0/act_${adAccountId}/adcreatives`;
    const formData = buildFormData({
        name: data.name,
        access_token: accessToken,
        object_story_spec: JSON.stringify({
        page_id: data.page_id,
        link_data: {
            image_url: data.image_url,
            link: data.link_url,
            message: data.body,
            name: data.title,
        },
        }),
    });

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        console.error('Ad creative creation failed:', result.error);
        throw new Error(result.error?.message || 'Ad creative creation failed');
    }
    return result;
    };

    export const createAd = async (data, accessToken, adAccountId) => {
    const url = `https://graph.facebook.com/v22.0/act_${adAccountId}/ads`;
    const formData = buildFormData({
        name: data.name,
        adset_id: data.adset_id,
        creative: JSON.stringify({ creative_id: data.creative_id }),
        status: data.status,
        access_token: accessToken,
    });

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        console.error('Ad creation failed:', result.error);
        throw new Error(result.error?.message || 'Ad creation failed');
    }
    return result;
    };
