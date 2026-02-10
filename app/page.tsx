import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Receipt, Share2, Wallet } from "lucide-react";

export default function Home() {
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
