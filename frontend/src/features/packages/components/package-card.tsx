"use client";

import type { TravelPackage, PackageStatus, PackageImage } from "@/features/packages/types/package.types";
import { PACKAGE_STATUS_COLORS } from "@/features/packages/types/package.types";
import { Calendar, MapPin, Users, IndianRupee, MoreVertical, Pencil, Trash2, Clock, MapPin as MapPinIcon, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  package: TravelPackage;
  onEdit: (pkg: TravelPackage) => void;
  onDelete: (pkg: TravelPackage) => void;
  onStatusChange: (pkg: TravelPackage, status: PackageStatus) => void;
  onViewDetail?: (pkg: TravelPackage) => void;
};

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

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
  if (available <= 0) return "text-gray-400";
  if (!max) return "text-green-600";
  const pct = (available / max) * 100;
  if (pct > 50) return "text-green-600";
  if (pct > 20) return "text-amber-600";
  return "text-red-600";
}

function getSeatBg(available: number, max?: number): string {
  if (available <= 0) return "bg-gray-100";
  if (!max) return "bg-green-50";
  const pct = (available / max) * 100;
  if (pct > 50) return "bg-green-50";
  if (pct > 20) return "bg-amber-50";
  return "bg-red-50";
}

function getSeatBorder(available: number, max?: number): string {
  if (available <= 0) return "border-gray-200";
  if (!max) return "border-green-200";
  const pct = (available / max) * 100;
  if (pct > 50) return "border-green-200";
  if (pct > 20) return "border-amber-200";
  return "border-red-200";
}

export function PackageCard({ package: pkg, onEdit, onDelete, onStatusChange, onViewDetail }: PackageCardProps) {
  const availableSeats = pkg.availableSeats ?? 0;
  const maxSeats = pkg.maxTravelers ?? 0;
  const primaryImage = getPrimaryImage(pkg);
  const duration = calculateDuration(pkg.startDate, pkg.endDate);
  const isSoldOut = availableSeats <= 0;

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden transition-shadow duration-200 pt-0",
      "border border-gray-100 shadow-sm hover:shadow-md",
      isSoldOut && "opacity-50"
    )}>
      {/* Image - First child of Card for pt-0 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || pkg.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.015]"
            loading="lazy"
          />
        ) : (
          <MapPinIcon className="absolute inset-0 w-10 h-10 mx-auto my-auto text-gray-300" />
        )}
        
        {/* Status badge - top left */}
        <span className={cn(
          "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
          "bg-white/95 backdrop-blur-sm shadow-sm",
          PACKAGE_STATUS_COLORS[pkg.status]
        )}>
          {pkg.status.replace("_", " ")}
        </span>

        {/* Price - bottom left on image */}
        <div className="absolute bottom-1.5 left-1.5">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
            <span className="font-bold text-gray-900">{formatPrice(pkg.price, pkg.currency)}</span>
            <span className="text-xs text-gray-500 ml-1">/{pkg.priceType === "per_person" ? "person" : "pkg"}</span>
          </div>
        </div>
      </div>

      {/* Content - Tight */}
      <CardContent className="p-2.5 pb-2 space-y-2">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{pkg.name}</h3>
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{pkg.destination}</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">{duration}</span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[130px] rounded-lg border-gray-200 shadow-lg p-1">
              {onViewDetail && (
                <DropdownMenuItem onClick={() => onViewDetail(pkg)} className="px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-gray-400" />View
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(pkg)} className="px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5 text-gray-400" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-200" />
              <DropdownMenuItem onClick={() => onDelete(pkg)} className="px-2.5 py-1.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3 Key Info Rows */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-2 min-w-0">
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Start</p>
            <p className="font-semibold text-[11px] text-gray-900 truncate flex items-center justify-center gap-0.5">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
              {formatDate(pkg.startDate)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-2 min-w-0">
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">End</p>
            <p className="font-semibold text-[11px] text-gray-900 truncate flex items-center justify-center gap-0.5">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
              {formatDate(pkg.endDate)}
            </p>
          </div>
          <div className={cn("rounded-lg border-2 p-2 min-w-0", getSeatBg(availableSeats, maxSeats), getSeatBorder(availableSeats, maxSeats))}>
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Seats</p>
            <p className={cn("font-bold text-lg", getSeatColor(availableSeats, maxSeats))}>{availableSeats > 0 ? availableSeats : "Sold Out"}</p>
            {maxSeats > 0 && availableSeats > 0 && <p className="text-[9px] text-gray-500">of {maxSeats}</p>}
          </div>
        </div>

        {/* Last Booking + Price Valid / Nights-Days */}
        <div className="grid grid-cols-2 gap-1.5 text-center">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-2 min-w-0">
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Last Booking</p>
            <p className="font-semibold text-[11px] text-gray-900 truncate flex items-center justify-center gap-0.5">
              <Clock className="h-3 w-3 text-amber-500 flex-shrink-0" />
              {formatDate(pkg.bookingDeadline)}
            </p>
          </div>
          {pkg.priceValidUntil ? (
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-2 min-w-0">
              <p className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Price Valid</p>
              <p className="font-medium text-[11px] text-amber-800 truncate">{formatDate(pkg.priceValidUntil)}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-2 min-w-0">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Nights/Days</p>
              <p className="font-medium text-[11px] text-gray-700 truncate">{pkg.durationNights}N / {pkg.durationDays}D</p>
            </div>
          )}
        </div>

        {/* Bottom Tags */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
            {pkg.geographicScope.charAt(0).toUpperCase() + pkg.geographicScope.slice(1)}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
            {pkg.tripTheme.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}