'use client';
import React, { useEffect, useState } from 'react';

// Creative data type
type CreativeData = {
    thumbnail: string;
    displayLabel: string;
    url: string;
    hash: string;
    selectedImage: string;
    primaryText: string;
    headline: string;
    description: string;
    callToAction: string;
    creativeType: 'IMAGE' | 'VIDEO' | null;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onDone: (data: CreativeData) => void;
    actId: string | null;
    accessToken: string | null;
    creativeType: any;
    initialUrl: string;
};

const AdCreativeModal: React.FC<Props> = ({ isOpen, onClose, onDone, actId, accessToken, creativeType, initialUrl }) => {
    const [step, setStep] = useState(1);
    const [mediaImages, setMediaImages] = useState<{ url: string; hash: string }[]>([]);
    const [mediaVideos, setMediaVideos] = useState<string[]>([]);

    const [thumbnail, setThumbnail] = useState('');
    const [displayLabel, setDisplayLabel] = useState('');
    const [url, setUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedImageHash, setSelectedImageHash] = useState('');
    const [primaryText, setPrimaryText] = useState('');
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [callToAction, setCallToAction] = useState('Learn More');

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('adCreativeDraft');
            if (saved) {
                const data: CreativeData = JSON.parse(saved);
                setThumbnail(data.thumbnail || '');
                setDisplayLabel(data.displayLabel || '');
                setUrl(data.url || '');
                setSelectedImage(data.selectedImage || '');
                setPrimaryText(data.primaryText || '');
                setHeadline(data.headline || '');
                setDescription(data.description || '');
                setCallToAction(data.callToAction || 'LEARN_MORE');
                setUrl(data.url);
            } else {
                setUrl(initialUrl);
            }
        }
    }, [isOpen, initialUrl]);

    useEffect(() => {
        const data: CreativeData = {
            thumbnail,
            displayLabel,
            url,
            hash: selectedImageHash,    
            selectedImage: selectedImage,
            primaryText,
            headline,
            description,
            callToAction,
            creativeType
        };
        localStorage.setItem('adCreativeDraft', JSON.stringify(data));
    }, [thumbnail, displayLabel, url, selectedImage, primaryText, headline, description, callToAction]);

    useEffect(() => {
        if (!actId || !accessToken || step !== 2) return;

        const fetchMedia = async () => {
            try {
                const res = await fetch(`https://graph.facebook.com/v22.0/act_${actId}?fields=adimages{url,hash},advideos{source}&access_token=${accessToken}`);
                const data = await res.json();
                setMediaImages(data?.adimages?.data || []);
                setMediaVideos(data?.advideos?.data?.map((vid: any) => vid.source) || []);
            } catch (err) {
                console.error("Error fetching media:", err);
            }
        };

        fetchMedia();
    }, [actId, accessToken, step]);

    const handleUploadMedia = async (file: File) => {
        if (!file || !actId || !accessToken) return;

        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('file', file);
        
        try {
            const uploadUrl = creativeType === 'video'
                ? `https://graph-video.facebook.com/v18.0/act_${actId}/advideos`
                : `https://graph.facebook.com/v18.0/act_${actId}/adimages`;

            const res = await fetch(uploadUrl, {
                method: 'POST',
                body: formData, // Remove headers for FormData
            });

            const result = await res.json();
            console.log('Upload result:', result);

            if (result.error) {
                throw new Error(result.error.message);
            }
            if (creativeType === 'image') {
                const imageHash = result.images[file.name].hash;
                const imageUrl = result.images[file.name].url;
                setSelectedImageHash(imageHash);
                setSelectedImage(imageUrl);
                return { hash: imageHash, selectedImage: imageUrl };
                } else if (creativeType === 'video') {
                // Fetch the video playback URL
                const videoPlaybackRes = await fetch(`https://graph.facebook.com/v18.0/${result.id}?fields=source&access_token=${accessToken}`);
                const videoPlaybackData = await videoPlaybackRes.json();
                const videoSourceUrl = videoPlaybackData.source;
                setSelectedImage(videoSourceUrl);
                return { id: result.id, selectedImage: videoSourceUrl };
            }


        } catch (error) {
            console.error("Upload failed:", error);
            throw error; // Re-throw to handle in calling function
        }
    };

    const handleNext = () => {
        if (step === 2 && !selectedImage) {
            alert("Please select or upload at least one media item before continuing.");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        const finalData: CreativeData = {
            thumbnail,
            displayLabel,
            url,
            hash: selectedImageHash,
            selectedImage: selectedImage,
            primaryText,
            headline,
            description,
            callToAction,
            creativeType
        };
        localStorage.setItem('adCreativeDraft', JSON.stringify(finalData));
        onDone(finalData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="border border-white p-6 rounded w-full max-w-xl space-y-4">
                <h2 className="text-lg font-semibold">Ad Creative Setup</h2>

                {step === 1 && (
                    <>
                        <div>
                            <label className="block font-medium mb-1">Source URL</label>
                            <input type="text" value={initialUrl} readOnly className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Thumbnail (optional)</label>
                            <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const base64 = reader.result as string;
                                        localStorage.setItem('uploadedThumbnail', base64);
                                        setThumbnail(base64);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }} className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Display Label (optional)</label>
                            <input type="text" value={displayLabel} onChange={(e) => setDisplayLabel(e.target.value)} className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">URL (optional)</label>
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full border px-3 py-2 rounded" />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <div>
                        <label className="block font-medium mb-2">Select or Upload Media</label>
                        <input
                            type="file"
                            accept={creativeType === 'video' ? 'video/*' : 'image/*'}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadMedia(file);
                            }}
                            className="mb-4 border ps-2 py-2 rounded"
                        />
                        <div className="grid grid-cols-3 gap-4">
                            {creativeType === 'image' && mediaImages.map(({ url, hash }, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt="Media"
                                    onClick={() => {
                                        setSelectedImage(url);
                                        setSelectedImageHash(hash);
                                    }}
                                    className={`w-full h-24 object-cover rounded cursor-pointer border ${selectedImage === url ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-300'}`}
                                />
                            ))}

                            {creativeType === 'video' && mediaVideos.map((src, idx) => (
                                <video
                                    key={`vid-${idx}`}
                                    src={src}
                                    controls
                                    onClick={() => setSelectedImage(src)}
                                    className={`w-full h-24 object-cover rounded cursor-pointer border ${selectedImage === src ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <>
                        <div>
                            <label className="block font-medium mb-1">Primary Text</label>
                            <input type="text" value={primaryText} onChange={(e) => setPrimaryText(e.target.value)} className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Headline</label>
                            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Call to Action</label>
                            <select value={callToAction} onChange={(e) => setCallToAction(e.target.value)} className="w-full border px-3 py-2 rounded">
                                <option className='text-black'>LEARN_MORE</option>
                                <option className='text-black'>Add to Cart</option>
                                <option className='text-black'>Sign Up</option>
                                <option className='text-black'>Shop Now</option>
                                <option className='text-black'>Buy Now</option>
                                <option className='text-black'>Subscribe</option>
                            </select>
                        </div>
                    </>
                )}

                <div className="flex justify-between mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-black rounded">
                        Cancel
                    </button>

                    <div className="space-x-2">
                        {step > 1 && (
                            <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded text-black">
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 2 && !selectedImage}
                                className={`px-4 py-2 rounded ${step === 2 && !selectedImage ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white'}`}
                            >
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdCreativeModal;
