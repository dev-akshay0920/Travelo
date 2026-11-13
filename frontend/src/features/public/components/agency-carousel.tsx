"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
    <section className="bg-background py-12" aria-labelledby="agencies-heading">
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
            <IconButton
              variant="outline"
              size="icon-sm"
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 border-border bg-background shadow-sm sm:flex md:-left-3"
              onClick={prev}
              disabled={currentIndex <= 0}
              label="Previous agencies"
            >
              <ChevronLeft className="size-4" />
            </IconButton>

            {/* Carousel */}
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
              {agencies.map((agency) => (
                <article
                  key={agency.id}
                  className={cn(
                    "flex-shrink-0 snap-center",
                    "w-full sm:max-w-[280px] md:max-w-[300px]"
                  )}
                >
                  <AgencyCard agency={agency} />
                </article>
              ))}
            </div>

            {/* Right Arrow */}
            <IconButton
              variant="outline"
              size="icon-sm"
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 border-border bg-background shadow-sm sm:flex md:-right-3"
              onClick={next}
              disabled={currentIndex >= maxIndex}
              label="Next agencies"
            >
              <ChevronRight className="size-4" />
            </IconButton>
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
                  "h-2 rounded-full transition-[width,background-color] duration-150 ease-out motion-reduce:transition-none",
                  i === currentIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
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
    <Card size="sm" variant="interactive" className="h-full gap-0 pt-0">
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
        {agency.logo ? (
          <Image
            src={agency.logo}
            alt={agency.name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <MapPin className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2.5 py-3">
        <CardTitle className="line-clamp-1">{agency.name}</CardTitle>
        <div className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{agency.destination}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-caption text-muted-foreground">{agency.packageCount} packages</span>
            {agency.rating && (
              <span className="inline-flex shrink-0 items-center gap-1 text-caption text-muted-foreground">
                <Star aria-hidden="true" className="size-3 fill-current text-brand-accent" />
                {agency.rating.toFixed(1)}
              </span>
            )}
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/agencies/${agency.slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AgencyCardSkeleton() {
  return (
    <Card size="sm" className="h-full w-full gap-0 overflow-hidden p-0 animate-pulse sm:max-w-[280px] md:max-w-[300px]">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="space-y-3 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  );
}