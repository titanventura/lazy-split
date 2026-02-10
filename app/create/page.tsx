'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, IndianRupee, Users, CreditCard } from "lucide-react";
import Link from 'next/link';
import { getStoredUserId, fetchUserProfile } from '@/lib/user';
import OnboardingModal from '@/components/OnboardingModal';

export default function CreateSplit() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const [form, setForm] = useState({
        description: '',
        totalAmount: '',
        numberOfPeople: '10', // Defaulted to 10
        creatorName: '',
        creatorUpiId: '',
    });

    useEffect(() => {
        const storedId = getStoredUserId();
        if (storedId) {
            setUserId(storedId);
            fetchUserProfile(storedId).then(profile => {
                if (profile) {
                    setForm(prev => ({
                        ...prev,
                        creatorName: profile.name,
                        creatorUpiId: profile.upi_id || ''
                    }));
                }
            });
        }
    }, []);

    const perPerson = form.totalAmount && form.numberOfPeople
        ? Math.floor(Number(form.totalAmount) * 100 / Number(form.numberOfPeople)) / 100
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setShowOnboarding(true);
            return;
        }

        setLoading(true);

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
                    creatorId: userId
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create split');
            }

            toast.success("Split created successfully!");
            router.push(`/split/${data.data.id}`); // Removed ?creator=true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingComplete = (user: { id: string, name: string, upi_id?: string }) => {
        setUserId(user.id);
        setShowOnboarding(false);
        setForm(prev => ({
            ...prev,
            creatorName: user.name,
            creatorUpiId: user.upi_id || ''
        }));
        toast.info("Profile created! Tap 'Create' again to finish.");
    };

    return (
        <main className="flex-1 bg-muted/30 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-lg space-y-4">
                <Button variant="ghost" size="sm" asChild className="mb-2">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                </Button>

                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Create Split</CardTitle>
                        <CardDescription>Enter bill details to share with your friends</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="description">What&apos;s this for?</Label>
                                <Input
                                    id="description"
                                    required
                                    maxLength={100}
                                    placeholder="e.g. Dinner at BBQ Nation"
                                    className="h-11"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalAmount" className="flex items-center">
                                        Total Amount <IndianRupee className="ml-1 h-3 w-3" />
                                    </Label>
                                    <Input
                                        id="totalAmount"
                                        type="number"
                                        required
                                        min="10"
                                        max="1000000"
                                        placeholder="2400"
                                        className="h-11"
                                        value={form.totalAmount}
                                        onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="people" className="flex items-center">
                                        People <Users className="ml-1 h-3 w-3" />
                                    </Label>
                                    <Select
                                        value={form.numberOfPeople}
                                        onValueChange={(v) => setForm({ ...form, numberOfPeople: v })}
                                    >
                                        <SelectTrigger id="people" className="h-11">
                                            <SelectValue placeholder="How many?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30, 50].map((n) => (
                                                <SelectItem key={n} value={n.toString()}>{n} people</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {userId && (
                                <div className="space-y-4 pt-2 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="creatorName">Your Name</Label>
                                        <Input
                                            id="creatorName"
                                            required
                                            maxLength={50}
                                            placeholder="e.g. Rahul Kumar"
                                            className="h-11 font-medium bg-muted/20"
                                            value={form.creatorName}
                                            onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="creatorUpiId" className="flex items-center">
                                            Your UPI ID <CreditCard className="ml-1 h-3 w-3" />
                                        </Label>
                                        <Input
                                            id="creatorUpiId"
                                            required
                                            placeholder="yourname@paytm"
                                            className="h-11 font-medium bg-muted/20"
                                            value={form.creatorUpiId}
                                            onChange={(e) => setForm({ ...form, creatorUpiId: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                            Used for receiving payments
                                        </p>
                                    </div>
                                </div>
                            )}

                            {perPerson > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 text-center animate-in zoom-in-95 duration-300">
                                    <p className="text-xs text-green-700 dark:text-green-400 font-bold uppercase tracking-widest mb-1">Each person pays</p>
                                    <div className="text-4xl font-extrabold text-green-600 dark:text-green-500">
                                        ₹{perPerson.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 rounded-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create & Share Link'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </main>
    );
}
