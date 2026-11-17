"use client";

import { Star, MessageSquareText, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { formatDateTime } from "@/features/agency/lib/format";

interface ReviewsSectionProps {
  packageId: string;
  agencyId: string;
  packageName?: string;
}

function StarPicker({
  value,
  onSelect,
  readOnly = false,
  size = "size-5",
}: {
  value: number;
  onSelect?: (rating: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={value >= star}
          disabled={readOnly}
          onClick={() => !readOnly && onSelect?.(star)}
          className={`rounded-md p-1.5 transition-colors ${
            value >= star
              ? "text-amber-500 fill-amber-500"
              : "text-muted-foreground/50 hover:text-amber-400"
          }`}
        >
          <Star className={`${size} fill-current`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ packageId, agencyId, packageName }: ReviewsSectionProps) {
  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment?: string; createdAt: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResult, listResult] = await Promise.all([
        reviewsApi.stats(packageId, agencyId),
        reviewsApi.list(packageId, agencyId, page),
      ]);
      setStats({ averageRating: statsResult.averageRating, totalReviews: statsResult.totalReviews });
      setRatingDistribution(statsResult.ratingDistribution ?? {});
      setReviews(
        listResult.items.map((item) => ({
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          createdAt: item.createdAt,
        })),
      );
      setTotalPages(listResult.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, [packageId, agencyId, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!userRating || userRating < 1 || userRating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submit({ packageId, agencyId, rating: userRating, comment: userComment.trim() || undefined });
      toast.success("Thanks for your review!");
      setUserRating(0);
      setUserComment("");
      setDialogOpen(false);
      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not submit your review.";
      if ((err as { status?: number })?.status === 409) {
        setError("You have already reviewed this package.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isAuthenticated = Boolean(window.localStorage.getItem("travora_access_token"));

  const percent = (count: number) =>
    stats?.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0;

  return (
    <section className="mt-8">
      <Card size="sm">
        <CardHeader className="flex items-center justify-between space-y-2 sm:space-y-0 sm:flex-row">
          <div>
            <CardTitle className="text-base font-semibold">Reviews</CardTitle>
            {stats ? (
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <StarPicker value={Math.round(stats.averageRating)} readOnly size="size-4" />
                <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>{" "}
                <span>({stats.totalReviews})</span>
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isAuthenticated}
              onClick={() => {
                setError("");
                setDialogOpen(true);
              }}
            >
              {isAuthenticated ? (
                <><MessageSquareText className="size-4 mr-2" aria-hidden="true" />Write a review</>
              ) : (
                <><MessageSquareText className="size-4 mr-2" aria-hidden="true" />Sign in to review</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Loading reviews…</div>
          ) : error ? (
            <p className="text-body-sm text-destructive text-center">{error}</p>
          ) : stats ? (
            stats.totalReviews === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-body-sm text-muted-foreground">No reviews yet for {packageName ?? "this package"}.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-body-sm">
                  <span className="text-muted-foreground">Overall rating</span>
                  <div className="flex items-center gap-1">
                    <StarPicker value={Math.round(stats.averageRating)} readOnly />
                    <span className="font-medium">{stats.averageRating.toFixed(1)} / 5</span>
                  </div>
                  <span className="text-muted-foreground">Total reviews</span>
                  <span className="font-medium">{stats.totalReviews}</span>
                </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-body-sm">
                    <div className="w-10 text-right">
                      <span className="text-muted-foreground">{star}</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${percent(ratingDistribution[star] ?? 0)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {ratingDistribution[star] ?? 0}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-body font-semibold">Traveller reviews</h3>
                  <span className="text-caption text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-body-sm font-medium">A traveller</span>
                          <span className="text-caption text-muted-foreground">
                            {formatDateTime(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarPicker value={review.rating} readOnly />
                        </div>
                        {review.comment && (
                          <p className="text-body-sm whitespace-pre-wrap">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-4 mr-2" aria-hidden="true" />
                      Prev
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="size-4 ml-2" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )
        )
      : (
        <p className="text-body-sm text-muted-foreground text-center py-4">No reviews yet.</p>
      )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>Share your experience with {packageName ?? "this package"}.</DialogDescription>
          </DialogHeader>
          {!isAuthenticated ? (
            <DialogBody className="space-y-3 p-6">
              <p className="text-body-sm text-muted-foreground">
                Sign in to submit a review. Reviews help other travellers choose the right package.
              </p>
            </DialogBody>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <DialogBody className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="review-rating">Your rating</Label>
                    <div className="flex items-center gap-1">
                      <StarPicker value={userRating} onSelect={setUserRating} />
                    </div>
                    <p className="text-caption text-muted-foreground text-right">
                      {userRating ? `${userRating} star${userRating === 1 ? "" : "s"}` : "Select a rating"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Comment (optional)</Label>
                    <Textarea
                      id="review-comment"
                      value={userComment}
                      onChange={(event) => setUserComment(event.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="What did you like about the trip?"
                      className="min-h-[120px]"
                    />
                    <p className="text-caption text-muted-foreground text-right">
                      {userComment.length}/2000
                    </p>
                  </div>
                  {error && (
                    <p role="alert" className="text-body-sm text-destructive">{error}</p>
                  )}
                </DialogBody>
                <DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-3 mx-0 mb-0">
                  <div className="flex items-center justify-between">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !userRating || userRating < 1 || userRating > 5}
                      className="px-4"
                    >
                      {submitting ? "Submitting…" : "Submit review"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
