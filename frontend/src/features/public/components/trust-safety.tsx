"use client";

import { Shield, Star, CreditCard, MessageSquare, Lock, Settings, CheckCircle2 } from "lucide-react";
import type { TrustBadge } from "@/features/public/api/public-packages.api";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent } from "@/components/ui/card";

const iconMap = {
  shield: Shield,
  star: Star,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  lock: Lock,
  settings: Settings,
  "check-circle": CheckCircle2,
} as const;

interface TrustSafetyProps {
  badges: TrustBadge[];
}

export function TrustSafety({ badges }: TrustSafetyProps) {
  const activeBadges = badges.filter(b => b.isActive).sort((a, b) => a.order - b.order);

  if (activeBadges.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-12" aria-labelledby="trust-heading">
      <PageContainer>
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Trust & Safety
          </span>
          <h2 id="trust-heading" className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Travel with Complete Peace of Mind</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">We&apos;ve built multiple layers of protection so you can book confidently</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {activeBadges.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <Card
                key={item.id}
                size="sm"
                className="items-center text-center"
                role="listitem"
              >
                <CardContent className="flex flex-col items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-card-title font-semibold text-foreground">{item.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </PageContainer>
    </section>
  );
}

function TrustSafetySkeleton() {
  return (
    <section className="py-16 bg-white" aria-hidden="true">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-6 w-32 mx-auto rounded-full bg-gray-200" />
          <div className="mt-3 h-8 w-64 mx-auto rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 mx-auto rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse">
              <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-gray-200" />
              <div className="h-5 w-24 mx-auto rounded bg-gray-200" />
              <div className="mt-2 h-4 w-32 mx-auto rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}