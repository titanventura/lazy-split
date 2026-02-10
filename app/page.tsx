'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Receipt, Share2, Wallet, Plus, Clock, CheckCircle2, IndianRupee } from "lucide-react";
import { getStoredUserId } from "@/lib/user";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = getStoredUserId();
    setUserId(storedId);

    if (storedId) {
      fetch(`/api/splits?userId=${storedId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSplits(data.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-3/4 mx-auto" />
          <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
          <div className="pt-12 space-y-4">
            <div className="h-24 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (splits.length > 0) {
    return (
      <main className="flex-1 bg-muted/30 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight text-primary">Your Splits</h1>
            <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 font-bold" asChild>
              <Link href="/create">
                <Plus className="mr-1 h-4 w-4" /> New
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {splits.map((split) => (
              <Link key={split.id} href={`/split/${split.id}`}>
                <Card className="hover:shadow-lg transition-all border-none shadow-md mb-4 group overflow-hidden active:scale-[0.98]">
                  <div className="bg-green-600 h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-green-700 transition-colors">{split.description}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(split.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Plus className="h-3 w-3" /> By {split.creator_name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-foreground">₹{(split.per_person_amount / 100).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Your Share</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
            Split <span className="text-green-600">Smart</span>.
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            The simplest way to settle bills with friends. No apps, no accounts, just split.
          </p>
          <div className="pt-4">
            <Button size="lg" className="rounded-full px-8 py-7 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" asChild>
              <Link href="/create">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Receipt, title: "1. Create", desc: "Enter bill details" },
            { icon: Share2, title: "2. Share", desc: "Link with friends" },
            { icon: Wallet, title: "3. Settle", desc: "Pay via UPI" },
          ].map((item, i) => (
            <Card key={i} className="border-none bg-background/50 backdrop-blur shadow-sm">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <item.icon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
