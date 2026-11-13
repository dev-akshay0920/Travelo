"use client";

import type { TravelPackage, PackageStatus, PackageImage } from "@/features/packages/types/package.types";
import { CalendarDays, MapPin, MoreVertical, Pencil, Trash2, MapPin as MapPinIcon, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconButton } from "@/components/ui/button";
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

export function PackageCard({ package: pkg, onEdit, onDelete, onStatusChange, onViewDetail }: PackageCardProps) {
  const availableSeats = pkg.availableSeats ?? 0;
  const primaryImage = getPrimaryImage(pkg);

  return (
    <Card
      size="sm"
      variant="interactive"
      className="h-full gap-0 pt-0"
    >
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
        <Badge
          variant="secondary"
          className={cn(
            "absolute left-3 top-3 border-0 shadow-none",
            pkg.status === "active" && "bg-success-muted text-success-foreground",
            pkg.status === "sold_out" && "bg-warning-muted text-warning-foreground",
            pkg.status === "cancelled" && "bg-destructive-muted text-destructive",
          )}
        >
          {pkg.status.replace("_", " ")}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-card-title font-semibold text-foreground">{pkg.name}</h3>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-body-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{pkg.destination}</span>
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

        <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">
            {formatDisplayDate(pkg.startDate, "Date not set")} – {formatDisplayDate(pkg.endDate, "Date not set")}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{pkg.durationDays} days</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">
              {formatPrice(pkg.price, pkg.currency)}
              <span className="ml-1 text-caption font-normal text-muted-foreground">
                /{pkg.priceType === "per_person" ? "person" : "package"}
              </span>
            </p>
          </div>
          <span className="shrink-0 text-caption text-muted-foreground">
            {availableSeats > 0 ? `${availableSeats} seats left` : "Sold out"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}