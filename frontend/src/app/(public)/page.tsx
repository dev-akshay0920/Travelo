import { PublicLayout } from "@/features/public/components/public-layout";
import { HeroSearch } from "@/features/public/components/hero-search";
import { AgencyCarousel } from "@/features/public/components/agency-carousel";
import { TrustSafety } from "@/features/public/components/trust-safety";
import { FeaturesSection } from "@/features/public/components/features-section";
import { fetchPlatformStats, fetchTrustBadges, fetchFeatures, fetchPublicAgencies } from "@/features/public/api/public-packages.api";
import Link from "next/link";
import type { PlatformStats, TrustBadge, FeatureItem, AgencySummary } from "@/features/public/api/public-packages.api";

export default async function LandingPage() {
  const [stats, trustBadges, features, agencies] = await Promise.all([
    fetchPlatformStats(),
    fetchTrustBadges(),
    fetchFeatures(),
    fetchPublicAgencies(8),
  ]);

  return (
    <PublicLayout>
      <div className="min-h-screen">
        <HeroSearch stats={stats} />
        <PopularDestinations />
        <HowItWorks />
        <AgencyCarousel agencies={agencies.items} error={agencies.error} />
        <TrustSafety badges={trustBadges} />
        <CTASection />
        <FeaturesSection features={features} />
      </div>
    </PublicLayout>
  );
}

function PopularDestinations() {
  const destinations = [
    { name: "Goa", slug: "goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=450&fit=crop", packages: 45, theme: "Beach", rating: 4.8 },
    { name: "Kerala", slug: "kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=450&fit=crop", packages: 38, theme: "Backwaters", rating: 4.9 },
    { name: "Rajasthan", slug: "rajasthan", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=450&fit=crop", packages: 32, theme: "Heritage", rating: 4.7 },
    { name: "Himachal", slug: "himachal", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop", packages: 28, theme: "Mountains", rating: 4.8 },
    { name: "Kashmir", slug: "kashmir", image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=450&fit=crop", packages: 24, theme: "Valleys", rating: 4.9 },
    { name: "Andaman", slug: "andaman", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=450&fit=crop", packages: 18, theme: "Islands", rating: 4.8 },
  ];

  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Popular Destinations
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Explore Top Destinations</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">Handpicked locations with the best experiences and verified agencies</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, index) => (
            <article
              key={dest.slug}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/packages?destination=${encodeURIComponent(dest.slug)}`} className="block relative aspect-[4/3] overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  priority={index < 3}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium">{dest.theme}</span>
                    <span className="flex items-center gap-1 text-white/90 text-sm">
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      {dest.rating}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                  <p className="text-white/80 text-sm mt-1">{dest.packages} packages available</p>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link href="/packages" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            View All Destinations
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { number: "01", title: "Search & Compare", description: "Enter your destination, dates, and preferences. Compare packages from verified agencies side by side.", icon: Search },
    { number: "02", title: "Read Real Reviews", description: "See authentic reviews from verified travelers who actually booked and experienced the packages.", icon: MessageSquare },
    { number: "03", title: "Book with Confidence", description: "Secure booking with best price guarantee. Get instant confirmation and 24/7 support.", icon: CreditCard },
    { number: "04", title: "Enjoy Your Trip", description: "Travel with peace of mind. Our agencies handle everything while you create memories.", icon: MapPin },
  ];

  return (
    <section className="bg-muted py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">How It Works</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Your Journey in 4 Simple Steps</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">We make travel planning effortless so you can focus on the experience</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative p-4 text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-gray-200 hidden lg:block" />
                </div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 mx-auto shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-white" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg">{step.number}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto animate-slide-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
            Ready to Travel?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start Planning Your Dream Trip Today
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who discover amazing experiences through our verified agency partners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/packages" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-xl group">
                Browse Packages
                <ArrowRight className="ml-2 h-5 w-5 inline transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/agencies" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors group">
                Find an Agency
                <ArrowRight className="ml-2 h-5 w-5 inline transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Search, Users, Sparkles, ArrowRight, Star, MessageSquare, MapPin, CreditCard } from "lucide-react";