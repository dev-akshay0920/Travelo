"use client";

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import {
  Upload,
  X,
  Image,
  Star,
  Trash2,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  uploadPackageImagesApi,
  deletePackageImageApi,
  setPrimaryImageApi,
  reorderImagesApi,
  getPresignedUploadUrlApi,
  uploadFileToPresignedUrl,
} from "@/features/packages/api/package.api";
import type { PackageImage, TravelPackage } from "@/features/packages/types/package.types";

type PackageImageInput = Omit<PackageImage, "createdAt">;

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  altText: string;
  isPrimary: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

interface PackageImageUploadProps {
  packageId: string;
  initialImages?: PackageImageInput[];
  onImagesChange?: (images: PackageImageInput[]) => void;
  onUploadComplete?: () => void;
  maxImages?: number;
  disabled?: boolean;
}

interface PackageImageUploadRef {
  uploadAllPending: () => Promise<void>;
}

const PackageImageUpload = forwardRef<PackageImageUploadRef, PackageImageUploadProps>(
  (
    {
      packageId,
      initialImages = [],
      onImagesChange,
      onUploadComplete,
      maxImages = MAX_IMAGES,
      disabled = false,
    },
    ref
  ) => {
  const [images, setImages] = useState<PackageImageInput[]>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  useImperativeHandle(ref, () => ({
    uploadAllPending: async () => {
      if (pendingFiles.length > 0) {
        await uploadAllPending();
      }
    },
  }));

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const notifyChange = useCallback((newImages: (PackageImageInput | PackageImage)[]) => {
    setImages(newImages as PackageImageInput[]);
    if (onImagesChange) {
      onImagesChange(newImages as PackageImageInput[]);
    }
  }, [onImagesChange]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File "${file.name}" must be JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" must be 5MB or smaller.`;
    }
    return null;
  };

  const createPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFiles = (files: FileList) => {
    const currentTotal = images.length + pendingFiles.length;
    if (currentTotal + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    const newPendingFiles: PendingFile[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      preview: createPreview(file),
      altText: file.name.replace(/\.[^/.]+$/, ""),
      isPrimary: images.length === 0 && pendingFiles.length === 0,
    }));

    const currentImagesCount = images.length;
    const currentPendingCount = pendingFiles.length;

    setPendingFiles((prevPending) => [...prevPending, ...newPendingFiles]);
    notifyChange([
      ...images,
      ...newPendingFiles.map((f, idx) => ({
        url: f.preview,
        key: f.id,
        altText: f.altText,
        isPrimary: f.isPrimary,
        order: currentImagesCount + currentPendingCount + idx,
      })),
    ]);
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
    setImages((prev) => prev.filter((img) => img.key !== id));
    notifyChange(images.filter((img) => img.key !== id));
  };

  const uploadAllPending = async (): Promise<PackageImageInput[]> => {
    if (pendingFiles.length === 0) return images;

    setIsUploading(true);
    const uploadProgressMap: Record<string, number> = {};
    pendingFiles.forEach(f => uploadProgressMap[f.id] = 0);
    setUploadProgress(uploadProgressMap);

    try {
      const uploadedImages: PackageImageInput[] = [];

      for (const pendingFile of pendingFiles) {
        const { uploadUrl, key, expiresIn } = await getPresignedUploadUrlApi(
          packageId,
          pendingFile.file.type,
          pendingFile.file.name
        );

        const controller = new AbortController();
        abortControllersRef.current.set(key, controller);

        await uploadFileToPresignedUrl(uploadUrl, pendingFile.file);

        uploadProgressMap[pendingFile.id] = 100;
        setUploadProgress({ ...uploadProgressMap });

        const newImage: PackageImageInput = {
          url: uploadUrl.split("?")[0],
          key,
          altText: pendingFile.altText,
          isPrimary: images.length === 0 && uploadedImages.length === 0 && pendingFile.isPrimary,
          order: images.length + uploadedImages.length,
        };

        uploadedImages.push(newImage);
      }

      const result = await uploadPackageImagesApi(packageId, {
        files: pendingFiles.map(f => ({
          key: uploadedImages.find(img => img.url.includes(f.id))?.key || "",
          mimeType: f.file.type,
          size: f.file.size,
          altText: f.altText,
        })).filter(f => f.key),
      });

      notifyChange(result.package.images || []);
      setPendingFiles([]);
      setUploadProgress({});
      onUploadComplete?.();
      return result.package.images || [];
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images");
      throw error;
    } finally {
      setIsUploading(false);
      abortControllersRef.current.clear();
    }
  };

  const handleDeleteImage = async (imageKey: string) => {
    const isPending = pendingFiles.some(f => f.id === imageKey);
    if (isPending) {
      removePendingFile(imageKey);
      return;
    }

    try {
      const result = await deletePackageImageApi(packageId, imageKey);
      notifyChange(result.package.images || []);
      toast.success("Image deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleSetPrimary = async (imageKey: string) => {
    const isPending = pendingFiles.some(f => f.id === imageKey);
    if (isPending) {
      const newPendingFiles = pendingFiles.map(f => ({
        ...f,
        isPrimary: f.id === imageKey,
      }));
      setPendingFiles(newPendingFiles);
      const newImages = images.map(img => ({
        ...img,
        isPrimary: img.key === imageKey,
      }));
      notifyChange(newImages);
      return;
    }

    try {
      const result = await setPrimaryImageApi(packageId, { imageId: imageKey });
      notifyChange(result.package.images || []);
      toast.success("Primary image updated");
    } catch (error) {
      console.error("Set primary failed:", error);
      toast.error("Failed to set primary image");
    }
  };

  const handleReorder = async (newImages: (PackageImageInput | PackageImage)[]) => {
    const pendingKeys = new Set(pendingFiles.map(f => f.id));
    const hasPending = newImages.some(img => pendingKeys.has(img.key));

    if (hasPending) {
      notifyChange(newImages);
      return;
    }

    const imageKeys = newImages.map((img) => img.key);
    try {
      const result = await reorderImagesApi(packageId, { imageIds: imageKeys });
      notifyChange(result.package.images || []);
    } catch (error) {
      console.error("Reorder failed:", error);
      toast.error("Failed to reorder images");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleAltTextChange = (imageKey: string, altText: string) => {
    const isPending = pendingFiles.some(f => f.id === imageKey);
    if (isPending) {
      setPendingFiles(prev => prev.map(f => f.id === imageKey ? { ...f, altText } : f));
    }
    const newImages = images.map((img) =>
      img.key === imageKey ? { ...img, altText } : img
    );
    notifyChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));
    handleReorder(reordered);
  };

  const allImages = (() => {
    const combined = [...images, ...pendingFiles.map(f => ({
      url: f.preview,
      key: f.id,
      altText: f.altText,
      isPrimary: f.isPrimary,
      order: images.length + pendingFiles.indexOf(f),
    }))];
    // Deduplicate by key, preferring pending files (newer)
    const seen = new Set<string>();
    return combined.filter(img => {
      if (seen.has(img.key)) return false;
      seen.add(img.key);
      return true;
    });
  })();

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Package Images</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {allImages.length}/{maxImages}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            "flex items-center justify-center min-h-[200px]",
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled || allImages.length >= maxImages}
            aria-label="Upload images"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-lg font-medium">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse. Max {maxImages} images, 5MB each (JPEG, PNG, WebP)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || allImages.length >= maxImages}
            >
              Select Images
            </Button>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploading images...</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pendingFiles.map((pf) => (
                <div key={pf.id} className="relative aspect-square rounded-lg border border-border overflow-hidden">
                  <img src={pf.preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Spinner label="Uploading image" size="lg" className="mx-auto text-white" />
                      <Progress value={uploadProgress[pf.id] || 0} className="mt-2 w-full max-w-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(allImages.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {images.length} image{images.length !== 1 ? "s" : ""} ready
                {pendingFiles.length > 0 && <span className="text-muted-foreground ml-2">({pendingFiles.length} pending)</span>}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReorderMode(!reorderMode)}
                disabled={isUploading}
              >
                <GripVertical className="h-4 w-4 mr-1" />
                {reorderMode ? "Done Reordering" : "Reorder"}
              </Button>
            </div>

            <div
              className={cn(
                "grid gap-3",
                "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                reorderMode && "reorder-mode"
              )}
            >
              {allImages.map((image, index) => {
                const isPending = pendingFiles.some(f => f.id === image.key);
                const uploadProgressValue = uploadProgress[image.key] || 0;
                return (
                  <div
                    key={image.key}
                    className={cn(
                      "relative aspect-square rounded-lg border overflow-hidden transition-colors duration-150 ease-out motion-reduce:transition-none",
                      "bg-background",
                      reorderMode && "cursor-grabbing",
                      isPending && "opacity-75"
                    )}
                    draggable={reorderMode && !isPending}
                    onDragStart={(e) => {
                      if (isPending) return;
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                      if (fromIndex !== index) {
                        moveImage(fromIndex, index);
                      }
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `Package image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isPending && uploadProgressValue < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Progress value={uploadProgressValue} className="w-full max-w-xs mx-4" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col items-end p-2 gap-1">
                      <div className="flex gap-1 w-full justify-end">
                        {image.isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Primary
                          </Badge>
                        )}
                        {!image.isPrimary && !isUploading && (
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(image.key);
                            }}
                            label="Set as primary"
                            disabled={isUploading}
                          >
                            <Star className="size-3 text-muted-foreground" />
                          </IconButton>
                        )}
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.key);
                          }}
                          label="Delete image"
                          disabled={isUploading}
                        >
                          <Trash2 className="size-3" />
                        </IconButton>
                      </div>
                      <div className="w-full">
                        <Input
                          type="text"
                          value={image.altText || ""}
                          onChange={(e) => handleAltTextChange(image.key, e.target.value)}
                          placeholder="Alt text (optional)"
                          className="text-xs bg-black/50 text-white border-border/50"
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                    {reorderMode && !isPending && !isUploading && (
                      <div className="absolute top-1 left-1 z-10">
                        <GripVertical aria-hidden="true" className="size-4 cursor-grab rounded bg-black/50 text-white" />
                      </div>
                    )}
                    {isPending && (
                      <div className="absolute bottom-1 left-1">
                        <Badge variant="secondary" className="gap-1 px-2 py-0.5">
                          <Spinner label="Updating image" size="sm" />
                          Pending
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between px-1">
                      <span className="text-xs text-white bg-black/50 px-1.5 rounded">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {allImages.length < maxImages && !disabled && !isUploading && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={allImages.length >= maxImages}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add More Images ({allImages.length}/{maxImages})
              </Button>
            )}
          </div>
        )}

        {allImages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No images added yet. Add images to showcase your package.
          </p>
        )}
      </CardContent>
    </Card>
  );
});

PackageImageUpload.displayName = "PackageImageUpload";

export { PackageImageUpload };