"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgencySummary } from "@/features/public/api/public-packages.api";

interface AgencyCarouselProps {
  agencies: AgencySummary[];
  error?: string;
}

export function AgencyCarousel({ agencies, error }: AgencyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.firstElementChild;
    if (!(firstCard instanceof HTMLElement)) return;

    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    const max = step > 0
      ? Math.max(0, Math.ceil((carousel.scrollWidth - carousel.clientWidth) / step))
      : 0;

    setCurrentIndex(Math.min(Math.round(carousel.scrollLeft / step), max));
    setMaxIndex(max);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const frame = requestAnimationFrame(updateScrollState);
    carousel.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      carousel.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [agencies.length, updateScrollState]);

  const scrollToIndex = (index: number) => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.firstElementChild;
    if (!carousel || !(firstCard instanceof HTMLElement)) return;

    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollTo({
      left: index * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  const next = () => scrollToIndex(Math.min(currentIndex + 1, maxIndex));
  const prev = () => scrollToIndex(Math.max(currentIndex - 1, 0));

  return (
    <section className="py-16 bg-white" aria-labelledby="agencies-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 id="agencies-heading" className="text-xl font-semibold text-gray-900">Approved Travel Agencies</h2>
          {agencies.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agencies" className="text-blue-600 hover:text-blue-700 font-medium">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          )}
        </div>

        {agencies.length > 0 ? (
          <div className="relative">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 md:-left-3 hidden sm:flex h-10 w-10 rounded-full shadow-lg bg-white border-gray-200 hover:bg-gray-50"
              onClick={prev}
              disabled={currentIndex <= 0}
              aria-label="Previous agencies"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Carousel */}
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
              {agencies.map((agency) => (
                <article
                  key={agency.id}
                  className={cn(
                    "flex-shrink-0 snap-center transition-transform duration-300",
                    "w-full sm:max-w-[280px] md:max-w-[300px]"
                  )}
                >
                  <AgencyCard agency={agency} />
                </article>
              ))}
            </div>

            {/* Right Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 md:-right-3 hidden sm:flex h-10 w-10 rounded-full shadow-lg bg-white border-gray-200 hover:bg-gray-50"
              onClick={next}
              disabled={currentIndex >= maxIndex}
              aria-label="Next agencies"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        ) : (
            <p className="text-sm text-gray-600" role={error ? "alert" : undefined}>
              {error ?? "No approved agencies are available yet."}
            </p>
        )}

        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === currentIndex ? "bg-blue-600 w-6" : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AgencyCard({ agency }: { agency: AgencySummary }) {
  return (
    <Card variant="interactive" className="h-full">
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
        {agency.logo ? (
          <Image
            src={agency.logo}
            alt={agency.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <MapPin className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{agency.name}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{agency.destination}</span>
        </div>
        <div className="flex items-center gap-2">
          {agency.rating && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              {agency.rating.toFixed(1)}
            </span>
          )}
          {agency.reviewCount && (
            <span className="text-xs text-gray-500">({agency.reviewCount} reviews)</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">{agency.packageCount} packages</span>
          <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 font-medium">
            <Link href={`/agencies/${agency.slug}`}>View</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AgencyCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border border-gray-100 w-full sm:max-w-[280px] md:max-w-[300px] animate-pulse">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  );
}