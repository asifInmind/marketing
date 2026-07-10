'use client';

import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDone: (mediaData: {
        selectedImage: string;
        primaryText: string;
        headline: string;
        description: string;
        callToAction: string;
    }) => void;
    }

    const dummyImages = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/160',
    'https://via.placeholder.com/170'
    ];

    export default function MediaModal({ isOpen, onClose, onDone }: Props) {
    const [selectedImage, setSelectedImage] = useState('');
    const [primaryText, setPrimaryText] = useState('');
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [callToAction, setCallToAction] = useState('Learn More');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded w-full max-w-xl space-y-4">
            <h2 className="text-lg font-semibold">Media Setup</h2>

            <div className="grid grid-cols-3 gap-4">
            {dummyImages.map(img => (
                <img
                key={img}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`border-2 cursor-pointer ${selectedImage === img ? 'border-blue-500' : 'border-gray-300'}`}
                alt="media"
                />
            ))}
            </div>

            <div>
            <label className="block font-medium mb-1">Primary Text</label>
            <input
                type="text"
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                className="w-full border px-3 py-2 rounded"
            />
            </div>

            <div>
            <label className="block font-medium mb-1">Headline</label>
            <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full border px-3 py-2 rounded"
            />
            </div>

            <div>
            <label className="block font-medium mb-1">Description</label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
            />
            </div>

            <div>
            <label className="block font-medium mb-1">Call to Action</label>
            <select
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full border px-3 py-2 rounded"
            >
                <option>Learn More</option>
                <option>Add to Cart</option>
                <option>Sign Up</option>
                <option>Subscribe</option>
            </select>
            </div>

            <div className="flex justify-between">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button
                onClick={() => onDone({ selectedImage, primaryText, headline, description, callToAction })}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Done
            </button>
            </div>
        </div>
        </div>
    );
}
