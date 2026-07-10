interface CreateAdPayload {
  name: string;
  adset_id: string;
  status: string;
  creative?: Record<string, any>;
}

export async function createNewAd(
  payload: CreateAdPayload,
  accessToken: string,
  actId: string
) {
  const cleanActId = actId.startsWith('act_') ? actId : `act_${actId}`;
  const url = `https://graph.facebook.com/v25.0/${cleanActId}/ads`;

  // Standard Mock Creative Requirements for execution if not sent by user
  const creativeObj = payload.creative || {
    title: "Sample Ad Creative Title",
    body: "Check out our latest updates!",
    image_hash: "mock_image_hash_placeholder"
  };

  const body = new URLSearchParams({
    name: payload.name,
    adset_id: payload.adset_id,
    status: payload.status,
    creative: JSON.stringify(creativeObj),
    access_token: accessToken,
  });

  const res = await fetch(url, {
    method: 'POST',
    body,
  });

  const json = await res.json();
  if (json.error) {
    console.error('Full Meta Ad Error:', json.error);
    throw new Error(json.error.error_user_msg || json.error.message);
  }
  return json;
}