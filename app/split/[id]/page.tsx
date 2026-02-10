'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';

interface Participant {
    id: string;
    name: string;
    hasPaid: boolean;
    markedPaidAt: string | null;
}

interface SplitData {
    id: string;
    description: string;
    totalAmount: number;
    numberOfPeople: number;
    perPersonAmount: number;
    creatorName: string;
    creatorUpiId: string;
    participants: Participant[];
    stats: {
        totalPaid: number;
        totalPending: number;
        amountCollected: number;
    };
}

export default function SplitView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const [split, setSplit] = useState<SplitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [name, setName] = useState('');
    const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const isCreator = searchParams.get('creator') === 'true';

    const fetchSplit = async () => {
        try {
            const res = await fetch(`/api/splits/${id}`);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            setSplit(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load split');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSplit();
        // Check localStorage for existing participant
        const stored = localStorage.getItem(`split-${id}`);
        if (stored) {
            setMyParticipantId(stored);
        } else if (!isCreator) {
            setShowNameModal(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isCreator]);

    const joinSplit = async () => {
        if (!name.trim()) return;
        try {
            const res = await fetch(`/api/splits/${id}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setMyParticipantId(data.data.participantId);
                localStorage.setItem(`split-${id}`, data.data.participantId);
                setShowNameModal(false);
                fetchSplit();
            }
        } catch {
            setError('Failed to join split');
        }
    };

    const togglePaid = async (participantId: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/splits/${id}/participants/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hasPaid: !currentStatus }),
            });
            fetchSplit();
        } catch {
            setError('Failed to update status');
        }
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.href.split('?')[0]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openUpiPayment = () => {
        if (!split) return;
        const amount = (split.perPersonAmount / 100).toFixed(2);
        const upiUrl = `upi://pay?pa=${encodeURIComponent(split.creatorUpiId)}&pn=${encodeURIComponent(split.creatorName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(split.description)}`;
        window.location.href = upiUrl;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </main>
        );
    }

    if (error || !split) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Split not found'}</p>
                    <a href="/" className="text-green-600 underline">Create a new split</a>
                </div>
            </main>
        );
    }

    const myParticipant = split.participants.find(p => p.id === myParticipantId);
    const allPaid = split.participants.length > 0 && split.stats.totalPending === 0;

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                {/* Split Details */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <h1 className="text-xl font-bold text-gray-900">{split.description}</h1>
                    <p className="text-gray-500 text-sm">by {split.creatorName}</p>

                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="font-semibold">₹{(split.totalAmount / 100).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Your share</span>
                            <span className="text-xl font-bold text-green-600">₹{(split.perPersonAmount / 100).toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Section (for participants) */}
                {!isCreator && myParticipantId && !myParticipant?.hasPaid && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                        <button
                            onClick={openUpiPayment}
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-green-700 transition-colors mb-3"
                        >
                            💰 Pay ₹{(split.perPersonAmount / 100).toFixed(0)} Now
                        </button>
                        <div className="text-center text-sm text-gray-500">
                            <p>Or pay manually to:</p>
                            <p className="font-mono text-gray-800">{split.creatorUpiId}</p>
                        </div>
                    </div>
                )}

                {/* Participants List */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-3">
                        Who&apos;s Paid? ({split.stats.totalPaid}/{split.participants.length})
                    </h2>

                    {allPaid && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-3 text-center">
                            🎉 Everyone paid! Split complete.
                        </div>
                    )}

                    <div className="space-y-2">
                        {split.participants.map((p) => (
                            <div
                                key={p.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${p.hasPaid ? 'bg-green-50' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{p.hasPaid ? '✅' : '⏳'}</span>
                                    <span className={p.id === myParticipantId ? 'font-semibold' : ''}>
                                        {p.name}
                                        {p.id === myParticipantId && ' (You)'}
                                    </span>
                                </div>
                                {p.id === myParticipantId && (
                                    <button
                                        onClick={() => togglePaid(p.id, p.hasPaid)}
                                        className={`text-sm px-3 py-1 rounded ${p.hasPaid
                                                ? 'bg-gray-200 text-gray-700'
                                                : 'bg-green-600 text-white'
                                            }`}
                                    >
                                        {p.hasPaid ? 'Unmark' : 'Mark Paid'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={fetchSplit}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={copyLink}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {copied ? '✓ Copied!' : '📋 Share Link'}
                    </button>
                </div>
            </div>

            {/* Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s your name?</h2>
                        <input
                            type="text"
                            placeholder="Your name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && joinSplit()}
                            autoFocus
                        />
                        <button
                            onClick={joinSplit}
                            disabled={!name.trim()}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            Join Split
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
