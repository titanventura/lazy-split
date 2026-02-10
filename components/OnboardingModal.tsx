'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { saveUserProfile } from '@/lib/user';
import { toast } from 'sonner';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (user: { id: string, name: string, upi_id?: string }) => void;
    title?: string;
    description?: string;
    showUpi?: boolean;
}

export default function OnboardingModal({
    isOpen,
    onComplete,
    title = "Welcome to Simple Split",
    description = "Enter your details to get started. We'll remember you for next time!",
    showUpi = true
}: OnboardingModalProps) {
    const [name, setName] = useState('');
    const [upi, setUpi] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const user = await saveUserProfile(name.trim(), upi.trim() || undefined);
            if (user) {
                onComplete(user);
                toast.success(`Welcome, ${user.name}!`);
            } else {
                toast.error('Failed to save profile');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="w-full max-w-sm border-none shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="onboard-name">Your Name</Label>
                            <Input
                                id="onboard-name"
                                required
                                maxLength={50}
                                placeholder="e.g. Rahul Kumar"
                                className="h-12 text-lg font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {showUpi && (
                            <div className="space-y-2">
                                <Label htmlFor="onboard-upi">UPI ID (Optional)</Label>
                                <Input
                                    id="onboard-upi"
                                    placeholder="yourname@paytm"
                                    className="h-12 font-medium"
                                    value={upi}
                                    onChange={(e) => setUpi(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Used for receiving payments
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 rounded-xl"
                        >
                            {loading ? "Saving..." : "Continue"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
