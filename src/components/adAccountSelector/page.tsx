'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AdAccountSelector({ accessToken }: { accessToken: string }) {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchAdAccounts = async () => {
        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`);
            const data = await res.json();

            if (data.error) {
            setError(data.error.message);
            return;
            }

            if (data.data.length === 1) {
            const id = data.data[0].id.replace('act_', '');
            router.push(`/choice/${id}?access_token=${accessToken}`);
            } else {
            setAccounts(data.data);
            }
        } catch {
            setError('Could not load ad accounts.');
        }
        };

        fetchAdAccounts();
    }, [accessToken]);

    const handleManualSubmit = (e: any) => {
        e.preventDefault();
        const id = new FormData(e.target).get('manualId') as string;
        if (id) {
        router.push(`/choice?${id}&access_token=${accessToken}`);
        }
    };

    return (
        <div>
        {error && <p>{error}</p>}
            <h2>Select an Ad Account</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const id = new FormData(e.currentTarget).get('account') as string;
                router.push(`/choice?${id}&access_token=${accessToken}`);
            }}>
                {accounts.map((acc) => (
                <div key={acc.id}>
                    <input type="radio" name="account" value={acc.id.replace('act_', '')} id={acc.id} />
                    <label htmlFor={acc.id}>{acc.name}</label>
                </div>
                ))}
                <button type="submit">Continue</button>
            </form>

            <hr />
            <form onSubmit={handleManualSubmit}>
                <label>Or enter Ad Account ID manually:</label>
                <input type="text" name="manualId" />
                <button type="submit">Go</button>
            </form>
        </div>
    );
}
