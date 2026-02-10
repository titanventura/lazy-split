'use client';

import { useState, useEffect, use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getStoredUserId, fetchUserProfile } from '@/lib/user';
import OnboardingModal from '@/components/OnboardingModal';
import Link from 'next/link';
import { ChevronLeft, IndianRupee, Users, RefreshCw, CheckCircle2, Clock, Wallet, Check, Copy } from "lucide-react";

interface Participant {
    id: string;
    userId: string | null;
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
    creatorId: string | null;
    createdAt: string;
    participants: Participant[];
    stats: {
        totalPaid: number;
        totalPending: number;
        amountCollected: number;
    };
}

export default function SplitView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [split, setSplit] = useState<SplitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<{ name: string, upi_id?: string } | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchSplit = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`/api/splits/${id}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSplit(data.data);
            return data.data as SplitData;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load split');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedId = getStoredUserId();
        setUserId(storedId);

        fetchSplit().then(data => {
            if (data && storedId) {
                // Check if user is already a participant
                const isParticipant = data.participants.some(p => p.userId === storedId);
                const isCreator = data.creatorId === storedId;

                if (!isParticipant && !isCreator) {
                    // Try to join automatically if we have a profile
                    fetchUserProfile(storedId).then(profile => {
                        if (profile) {
                            joinSplit(profile.name, storedId);
                        } else {
                            setShowOnboarding(true);
                        }
                    });
                }
            } else if (!storedId) {
                setShowOnboarding(true);
            }
        });
    }, [id]);

    const joinSplit = async (name: string, uid: string) => {
        try {
            const res = await fetch(`/api/splits/${id}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), userId: uid }),
            });
            const data = await res.json();
            if (data.success) {
                fetchSplit(true);
                toast.success(`Welcome, ${name.trim()}!`);
                setShowOnboarding(false);
            }
        } catch {
            toast.error('Failed to join split');
        }
    };

    const handleOnboardingComplete = (user: { id: string, name: string, upi_id?: string }) => {
        setUserId(user.id);
        setUserProfile({ name: user.name, upi_id: user.upi_id });
        joinSplit(user.name, user.id);
    };

    const togglePaid = async (participantId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/splits/${id}/participants/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hasPaid: !currentStatus }),
            });
            const data = await res.json();
            if (data.success) {
                fetchSplit(true);
                toast.success(currentStatus ? "Marked as unpaid" : "Marked as paid!");
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
        setCopied(true);
        toast.info("Link copied to clipboard!");
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
            <main className="flex-1 bg-muted/30 p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-lg space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <Skeleton className="h-[100px] w-full rounded-2xl" />
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
            </main>
        );
    }

    if (!split) return null;

    const myParticipant = split.participants.find(p => p.userId === userId);
    const isCreator = split.creatorId === userId;
    const allPaid = split.participants.length > 0 && split.stats.totalPending === 0;

    return (
        <main className="flex-1 bg-muted/30 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-lg space-y-6">
                <div className="flex items-center justify-between w-full mb-2">
                    <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to home
                    </Link>
                </div>

                {/* Main Bill Card */}
                <Card className="border-none shadow-xl overflow-hidden">
                    <div className="bg-green-600 h-2 w-full" />
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-bold">{split.description}</CardTitle>
                                <CardDescription className="flex flex-col gap-1 mt-1">
                                    <span>Created by {split.creatorName} {isCreator && '(You)'}</span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        <Clock className="h-3 w-3" /> {new Date(split.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className={`${allPaid ? 'bg-green-50 text-green-700 border-green-200' : 'hidden'}`}>
                                {allPaid ? 'Settled' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 border-t bg-muted/5">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Amount</p>
                                <p className="text-2xl font-bold">₹{(split.totalAmount / 100).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-xs font-bold text-green-700 uppercase tracking-wider italic">Share / Person</p>
                                <p className="text-3xl font-black text-green-600">₹{(split.perPersonAmount / 100).toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Split amongst {split.numberOfPeople} people</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Bar */}
                <div className="flex items-center gap-2 px-1">
                    <div className="flex -space-x-2">
                        {split.participants.slice(0, 5).map((p) => (
                            <div key={p.id} className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${p.hasPaid ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                        {split.stats.totalPaid} of {split.numberOfPeople} paid
                    </p>
                    <div className="ml-auto w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(split.stats.totalPaid / split.numberOfPeople) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Payment Card */}
                {!isCreator && userId && !myParticipant?.hasPaid && (
                    <Card className="border-none shadow-lg bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardContent className="p-6">
                            <Button
                                onClick={openUpiPayment}
                                className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 rounded-2xl mb-4"
                            >
                                <Wallet className="mr-3 h-6 w-6" /> PAY NOW
                            </Button>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-2 rounded-lg font-medium">
                                <span className="opacity-50">UPI ID:</span>
                                <span className="font-mono text-foreground font-bold">{split.creatorUpiId}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {myParticipant?.hasPaid && (
                    <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 animate-in zoom-in-95 duration-500">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Check className="h-6 w-6 stroke-[3px]" />
                        </div>
                        <div>
                            <p className="font-black text-xl leading-tight">Paid!</p>
                            <p className="text-xs text-white/80 font-medium">You&apos;ve settled your share. Awesome!</p>
                        </div>
                    </div>
                )}

                {/* Participants List */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Users className="h-4 w-4" /> Participants
                        </CardTitle>
                        {allPaid && <Badge className="bg-green-500 text-white border-transparent">Settled</Badge>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {split.participants.map((p) => (
                            <div
                                key={p.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${p.hasPaid
                                    ? 'bg-green-50/50 border-green-100'
                                    : 'bg-background border-muted'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${p.hasPaid ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {p.hasPaid ? <CheckCircle2 className="h-5 w-5" /> : p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${p.userId === userId ? 'text-green-700' : ''}`}>
                                            {p.name} {p.userId === userId && '(You)'}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {p.hasPaid ? (
                                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Paid</p>
                                            ) : (
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-1">
                                                    <Clock className="h-2 w-2" /> Pending
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {(p.userId === userId || isCreator) && (
                                    <Button
                                        variant={p.hasPaid ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => togglePaid(p.id, p.hasPaid)}
                                        className={`rounded-lg font-bold text-xs h-8 ${!p.hasPaid && 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {p.hasPaid ? 'Unmark' : (p.userId === userId ? 'I Paid' : 'Mark Paid')}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="secondary"
                        onClick={() => fetchSplit(false)}
                        className="flex-1 h-12 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync
                    </Button>
                    <Button
                        variant="outline"
                        onClick={copyLink}
                        className="flex-1 h-12 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm bg-white"
                    >
                        {copied ? (
                            <><Check className="mr-2 h-4 w-4 text-green-600" /> Done</>
                        ) : (
                            <><Copy className="mr-2 h-4 w-4" /> Share</>
                        )}
                    </Button>
                </div>
            </div>

            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
                title="Join Split"
                description="Enter your name to join this split and track your payment."
                showUpi={false}
            />
        </main>
    );
}
