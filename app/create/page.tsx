'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSplit() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        description: '',
        totalAmount: '',
        numberOfPeople: '2',
        creatorName: '',
        creatorUpiId: '',
    });

    const perPerson = form.totalAmount && form.numberOfPeople
        ? Math.floor(Number(form.totalAmount) * 100 / Number(form.numberOfPeople)) / 100
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/splits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: form.description,
                    totalAmount: Math.round(Number(form.totalAmount) * 100), // Convert to paise
                    numberOfPeople: Number(form.numberOfPeople),
                    creatorName: form.creatorName,
                    creatorUpiId: form.creatorUpiId,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create split');
            }

            // Copy link to clipboard
            const shareUrl = `${window.location.origin}/split/${data.data.id}`;
            await navigator.clipboard.writeText(shareUrl);

            router.push(`/split/${data.data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Split</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What&apos;s this for?
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={100}
                            placeholder="Dinner at BBQ Nation"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Amount (₹)
                        </label>
                        <input
                            type="number"
                            required
                            min="10"
                            max="100000"
                            placeholder="2400"
                            inputMode="numeric"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={form.totalAmount}
                            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of People
                        </label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={form.numberOfPeople}
                            onChange={(e) => setForm({ ...form, numberOfPeople: e.target.value })}
                        >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>{n} people</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={50}
                            placeholder="Rahul Kumar"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={form.creatorName}
                            onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your UPI ID
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="yourname@paytm or 9876543210"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={form.creatorUpiId}
                            onChange={(e) => setForm({ ...form, creatorUpiId: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Your UPI ID or phone number linked to UPI</p>
                    </div>

                    {perPerson > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Each person pays</p>
                            <p className="text-2xl font-bold text-green-600">₹{perPerson.toFixed(0)}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-semibold py-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create & Share Link'}
                    </button>
                </form>
            </div>
        </main>
    );
}
