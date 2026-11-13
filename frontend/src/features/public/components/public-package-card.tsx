"use client";

import Link from "next/link";
import { CalendarDays, MapPin, MapPin as MapPinIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InquiryFormDialog } from "@/features/leads/components/inquiry-form-dialog";
import type { TravelPackage, PackageStatus, PackageImage } from "@/features/public/types/public-filters.types";
import { formatDisplayDate } from "@/lib/date-format";

type PackageCardProps = {
  package: TravelPackage;
  onEdit?: (pkg: TravelPackage) => void;
  onDelete?: (pkg: TravelPackage) => void;
  onStatusChange?: (pkg: TravelPackage, status: PackageStatus) => void;
  onViewDetail?: (pkg: TravelPackage) => void;
};

function formatPrice(price: number, currency = "INR"): string {
  return currency === "INR"
    ? `₹${price.toLocaleString("en-IN")}`
    : `${currency} ${price.toLocaleString("en-US")}`;
}

function getPrimaryImage(pkg: TravelPackage): PackageImage | undefined {
  return pkg.images?.find((image) => image.isPrimary) ?? pkg.images?.[0];
}

export function PackageCard({
  package: pkg,
  onEdit,
  onDelete,
  onViewDetail,
}: PackageCardProps) {
  const primaryImage = getPrimaryImage(pkg);
  const isAvailable = pkg.status === "active" && pkg.availableSeats > 0;
  const hasActions = Boolean(onEdit || onDelete || onViewDetail);

  return (
    <Card size="sm" variant="interactive" className="h-full gap-0 p-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || pkg.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <MapPinIcon
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
          />
        )}
        {!isAvailable && (
          <Badge variant="secondary" className="absolute left-3 top-3 border-0">
            {pkg.status === "active" ? "Sold out" : pkg.status.replaceAll("_", " ")}
          </Badge>
        )}
        <div className="absolute bottom-3 left-3 rounded-md bg-card px-2.5 py-1.5 text-body-sm font-semibold text-foreground shadow-card">
          {formatPrice(pkg.price, pkg.currency)}
          <span className="ml-1 text-caption font-normal text-muted-foreground">
            /{pkg.priceType === "per_person" ? "person" : "package"}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-card-title font-semibold text-foreground">
              {pkg.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{pkg.destination}</span>
            </p>
          </div>
          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  label={`More actions for ${pkg.name}`}
                  className="shrink-0 text-muted-foreground"
                >
                  <MoreVertical aria-hidden="true" className="size-4" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetail && (
                  <DropdownMenuItem onClick={() => onViewDetail(pkg)}>
                    View details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(pkg)}>
                    <Pencil aria-hidden="true" className="size-3.5" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(pkg)} variant="destructive">
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">
            {formatDisplayDate(pkg.startDate, "Date not set")} – {formatDisplayDate(pkg.endDate, "Date not set")}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{pkg.durationDays} days</span>
        </div>

        <div className="mt-auto grid gap-2 pt-1 sm:grid-cols-2">
          <Button asChild type="button" variant="outline" size="sm">
            <Link href={`/packages/${encodeURIComponent(pkg.id)}`}>View details</Link>
          </Button>
          {isAvailable ? (
            <InquiryFormDialog
              agencyId={pkg.agencyId}
              packageId={pkg.id}
              packageName={pkg.name}
              size="sm"
              className="w-full"
            />
          ) : (
            <Button type="button" size="sm" className="w-full" disabled>
              Unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
