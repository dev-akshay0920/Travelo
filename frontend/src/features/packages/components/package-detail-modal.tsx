"use client";

import { useState, useEffect } from "react";
import type { TravelPackage, PackageImage } from "@/features/packages/types/package.types";
import { X, Calendar, MapPin, Users, IndianRupee, Sparkles, ChevronLeft, ChevronRight, Expand, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PACKAGE_STATUS_COLORS } from "@/features/packages/types/package.types";
import { cn } from "@/lib/utils";

type PackageDetailModalProps = {
  package: TravelPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pkg: TravelPackage) => void;
};

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
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

export function PackageDetailModal({ package: pkg, isOpen, onClose, onEdit }: PackageDetailModalProps) {
  if (!pkg) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = pkg.images || [];
  const primaryImage = getPrimaryImage(pkg);
  const primaryIndex = primaryImage ? images.findIndex((img) => img.key === primaryImage.key) : 0;

  useEffect(() => {
    setSelectedImageIndex(primaryIndex);
  }, [primaryIndex, images.length]);

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{pkg.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {pkg.destination}
              </DialogDescription>
            </div>
            <Badge className={PACKAGE_STATUS_COLORS[pkg.status]}>
              {pkg.status.replace("_", " ")}
            </Badge>
          </div>
        </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].altText || `${pkg.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80"
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            index === selectedImageIndex
                              ? "bg-primary w-6"
                              : "bg-white/50 hover:bg-white/75"
                          )}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.key}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all",
                        index === selectedImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.altText || `${pkg.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-1 right-1">
                          <Badge variant="secondary" className="gap-0.5 px-1.5 py-0.5">
                            <ImageIcon className="h-2 w-2" />
                            <span className="text-xs">Primary</span>
                          </Badge>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}</p>
                <p className="text-xs text-muted-foreground">{pkg.durationDays} Days / {pkg.durationNights} Nights</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatPrice(pkg.price, pkg.currency)}</p>
                <p className="text-xs text-muted-foreground capitalize">{pkg.priceType.replace("_", " ")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{pkg.availableSeats} seats available</span>
          </div>

          {pkg.description && (
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </div>
          )}

          {pkg.highlights && pkg.highlights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    <Sparkles className="h-3 w-3" />
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Inclusions</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {pkg.inclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {pkg.exclusions && pkg.exclusions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Exclusions</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {pkg.exclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Itinerary</h3>
              <div className="space-y-3">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{day.description}</p>
                    {day.accommodation && (
                      <p className="text-xs text-muted-foreground mt-1">Accommodation: {day.accommodation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pkg.termsAndConditions && (
            <div>
              <h3 className="font-semibold mb-1">Terms & Conditions</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pkg.termsAndConditions}</p>
            </div>
          )}

          {pkg.cancellationPolicy && (
            <div>
              <h3 className="font-semibold mb-1">Cancellation Policy</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pkg.cancellationPolicy}</p>
            </div>
          )}

        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => { onClose(); onEdit(pkg); }}>
            Edit Package
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}