"use client";

import { Search, Sparkles, MapPin, MessageSquare, Star, CreditCard, Lock, Settings, Shield, Heart, Users, Calendar } from "lucide-react";
import type { FeatureItem } from "@/features/public/api/public-packages.api";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent } from "@/components/ui/card";

const iconMap = {
  search: Search,
  sparkles: Sparkles,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  star: Star,
  "credit-card": CreditCard,
  lock: Lock,
  settings: Settings,
  shield: Shield,
  heart: Heart,
  users: Users,
  calendar: Calendar,
} as const;

const colorClasses = {
  blue: { iconBg: "bg-blue-100", iconColor: "text-blue-700" },
  purple: { iconBg: "bg-purple-100", iconColor: "text-purple-700" },
  amber: { iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  emerald: { iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  rose: { iconBg: "bg-rose-100", iconColor: "text-rose-700" },
  indigo: { iconBg: "bg-indigo-100", iconColor: "text-indigo-700" },
  green: { iconBg: "bg-green-100", iconColor: "text-green-700" },
  orange: { iconBg: "bg-orange-100", iconColor: "text-orange-700" },
} as const;

interface FeaturesSectionProps {
  features: FeatureItem[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const activeFeatures = features.filter(f => f.isActive).sort((a, b) => a.order - b.order);

  if (activeFeatures.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-12" aria-labelledby="features-heading">
      <PageContainer>
        <div className="mb-8 text-center">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to Travel Smart</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">Powerful features designed for modern travelers</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {activeFeatures.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <Card
                key={feature.id}
                size="sm"
                className="items-center text-center"
                role="listitem"
              >
                <CardContent className="flex flex-col items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-md ${colors.iconBg} ${colors.iconColor}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-card-title font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </PageContainer>
    </section>
  );
}

function FeaturesSkeleton() {
  return (
    <section className="py-16 bg-white" aria-hidden="true">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 w-64 mx-auto rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 mx-auto rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 animate-pulse">
              <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gray-200" />
              <div className="h-5 w-24 mx-auto rounded bg-gray-200" />
              <div className="mt-2 h-4 w-32 mx-auto rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}