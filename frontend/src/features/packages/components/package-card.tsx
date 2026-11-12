"use client";

import type { TravelPackage, PackageStatus, PackageImage } from "@/features/packages/types/package.types";
import { PACKAGE_STATUS_COLORS } from "@/features/packages/types/package.types";
import { Calendar, MapPin, Users, IndianRupee, MoreVertical, Pencil, Trash2, Clock, MapPin as MapPinIcon, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/date-format";

type PackageCardProps = {
  package: TravelPackage;
  onEdit: (pkg: TravelPackage) => void;
  onDelete: (pkg: TravelPackage) => void;
  onStatusChange: (pkg: TravelPackage, status: PackageStatus) => void;
  onViewDetail?: (pkg: TravelPackage) => void;
};

function formatPrice(price: number, currency: string = "INR"): string {
  if (currency === "INR") {
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return `${currency} ${price.toLocaleString("en-US")}`;
}

function getPrimaryImage(pkg: TravelPackage): PackageImage | undefined {
  return pkg.images?.find((img) => img.isPrimary) || pkg.images?.[0];
}

function calculateDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "—";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}D`;
}

function getSeatColor(available: number, max?: number): string {
  if (available <= 0) return "text-muted-foreground";
  if (!max) return "text-success";
  const pct = (available / max) * 100;
  if (pct > 50) return "text-success";
  if (pct > 20) return "text-warning";
  return "text-destructive";
}

function getSeatBg(available: number, max?: number): string {
  if (available <= 0) return "bg-muted";
  if (!max) return "bg-success-muted";
  const pct = (available / max) * 100;
  if (pct > 50) return "bg-success-muted";
  if (pct > 20) return "bg-warning-muted";
  return "bg-destructive-muted";
}

function getSeatBorder(available: number, max?: number): string {
  if (available <= 0) return "border-border";
  if (!max) return "border-success/30";
  const pct = (available / max) * 100;
  if (pct > 50) return "border-success/30";
  if (pct > 20) return "border-warning/30";
  return "border-destructive/30";
}

export function PackageCard({ package: pkg, onEdit, onDelete, onStatusChange, onViewDetail }: PackageCardProps) {
  const availableSeats = pkg.availableSeats ?? 0;
  const maxSeats = pkg.maxTravelers ?? 0;
  const primaryImage = getPrimaryImage(pkg);
  const duration = calculateDuration(pkg.startDate, pkg.endDate);
  const isSoldOut = availableSeats <= 0;

  return (
    <Card
      size="sm"
      variant="interactive"
      className={cn("flex flex-col gap-0 pt-0", isSoldOut && "opacity-50")}
    >
      {/* Image - First child of Card for pt-0 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || pkg.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <MapPinIcon className="absolute inset-0 w-10 h-10 mx-auto my-auto text-muted-foreground" />
        )}
        
        {/* Status badge - top left */}
        <span className={cn(
          "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-caption font-semibold",
          "bg-card/95 shadow-sm",
          PACKAGE_STATUS_COLORS[pkg.status]
        )}>
          {pkg.status.replace("_", " ")}
        </span>

        {/* Price - bottom left on image */}
        <div className="absolute bottom-1.5 left-1.5">
          <div className="bg-card/95 rounded-lg px-3 py-2 shadow-md">
            <span className="font-bold text-foreground">{formatPrice(pkg.price, pkg.currency)}</span>
            <span className="text-caption text-muted-foreground ml-1">/{pkg.priceType === "per_person" ? "person" : "pkg"}</span>
          </div>
        </div>
      </div>

      {/* Content - Tight */}
      <CardContent className="space-y-3">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-card-title text-foreground line-clamp-1">{pkg.name}</h3>
            <p className="flex items-center gap-1 text-body-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{pkg.destination}</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-muted text-caption font-medium text-muted-foreground">{duration}</span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                label={`More actions for ${pkg.name}`}
                className="rounded-lg text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              {onViewDetail && (
                <DropdownMenuItem onClick={() => onViewDetail(pkg)} className="text-body-sm font-medium">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />View
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(pkg)} className="text-body-sm font-medium">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={() => onDelete(pkg)} variant="destructive" className="text-body-sm font-medium">
                <Trash2 className="h-3.5 w-3.5" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3 Key Info Rows */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-lg border border-border p-2.5 min-w-0">
            <p className="text-caption font-semibold text-muted-foreground">Start</p>
            <p className="font-semibold text-body-sm text-foreground truncate flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
              {formatDisplayDate(pkg.startDate, "—")}
            </p>
          </div>
          <div className="bg-muted rounded-lg border border-border p-2.5 min-w-0">
            <p className="text-caption font-semibold text-muted-foreground">End</p>
            <p className="font-semibold text-body-sm text-foreground truncate flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
              {formatDisplayDate(pkg.endDate, "—")}
            </p>
          </div>
          <div className={cn("rounded-lg border-2 p-2 min-w-0", getSeatBg(availableSeats, maxSeats), getSeatBorder(availableSeats, maxSeats))}>
            <p className="text-caption font-semibold text-muted-foreground">Seats</p>
            <p className={cn("font-bold text-card-title", getSeatColor(availableSeats, maxSeats))}>{availableSeats > 0 ? availableSeats : "Sold Out"}</p>
            {maxSeats > 0 && availableSeats > 0 && <p className="text-caption text-muted-foreground">of {maxSeats}</p>}
          </div>
        </div>

        {/* Last Booking + Price Valid / Nights-Days */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-muted rounded-lg border border-border p-2.5 min-w-0">
            <p className="text-caption font-semibold text-muted-foreground">Last Booking</p>
            <p className="font-semibold text-body-sm text-foreground truncate flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-brand-accent flex-shrink-0" />
              {formatDisplayDate(pkg.bookingDeadline, "—")}
            </p>
          </div>
          {pkg.priceValidUntil ? (
            <div className="bg-brand-accent-soft rounded-lg border border-brand-accent/30 p-2.5 min-w-0">
              <p className="text-caption font-semibold text-brand-accent-foreground">Price Valid</p>
              <p className="font-medium text-body-sm text-brand-accent-foreground truncate">{formatDisplayDate(pkg.priceValidUntil, "—")}</p>
            </div>
          ) : (
            <div className="bg-muted rounded-lg border border-border p-2.5 min-w-0">
              <p className="text-caption font-semibold text-muted-foreground">Nights/Days</p>
              <p className="font-medium text-body-sm text-foreground truncate">{pkg.durationNights}N / {pkg.durationDays}D</p>
            </div>
          )}
        </div>

        {/* Bottom Tags */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="px-2 py-1 rounded-full text-caption font-medium bg-accent text-accent-foreground border border-border whitespace-nowrap">
            {pkg.geographicScope.charAt(0).toUpperCase() + pkg.geographicScope.slice(1)}
          </span>
          <span className="px-2 py-1 rounded-full text-caption font-medium bg-accent text-accent-foreground border border-border whitespace-nowrap">
            {pkg.tripTheme.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}