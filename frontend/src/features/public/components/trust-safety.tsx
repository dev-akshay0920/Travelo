"use client";

import { Shield, Star, CreditCard, MessageSquare, Lock, Settings, CheckCircle2 } from "lucide-react";
import type { TrustBadge } from "@/features/public/api/public-packages.api";

const iconMap = {
  shield: Shield,
  star: Star,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  lock: Lock,
  settings: Settings,
  "check-circle": CheckCircle2,
} as const;

const colorClasses = {
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-700", hoverBg: "group-hover:bg-blue-600", hoverIcon: "group-hover:text-white" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-700", hoverBg: "group-hover:bg-amber-600", hoverIcon: "group-hover:text-white" },
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", hoverBg: "group-hover:bg-emerald-600", hoverIcon: "group-hover:text-white" },
  purple: { bg: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-700", hoverBg: "group-hover:bg-purple-600", hoverIcon: "group-hover:text-white" },
  green: { bg: "bg-green-50", iconBg: "bg-green-100", iconColor: "text-green-700", hoverBg: "group-hover:bg-green-600", hoverIcon: "group-hover:text-white" },
  indigo: { bg: "bg-indigo-50", iconBg: "bg-indigo-100", iconColor: "text-indigo-700", hoverBg: "group-hover:bg-indigo-600", hoverIcon: "group-hover:text-white" },
  rose: { bg: "bg-rose-50", iconBg: "bg-rose-100", iconColor: "text-rose-700", hoverBg: "group-hover:bg-rose-600", hoverIcon: "group-hover:text-white" },
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
    <section className="py-16 bg-white" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Trust & Safety
          </span>
          <h2 id="trust-heading" className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Travel with Complete Peace of Mind</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">We&apos;ve built multiple layers of protection so you can book confidently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {activeBadges.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const colors = colorClasses[item.color as keyof typeof colorClasses];

            return (
              <article
                key={item.id}
                className={`group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 animate-slide-up ${colors.bg}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                role="listitem"
              >
                <div className={`mx-auto mb-4 h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 ${colors.iconBg} ${colors.iconColor} ${colors.hoverBg} ${colors.hoverIcon}`}>
                  <Icon className="h-7 w-7 transition-colors duration-300" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
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