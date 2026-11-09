"use client";

import { useState, useEffect, useCallback } from "react";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle, RefreshCw, Send, Package, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TravellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [packageId, setPackageId] = useState("");
  const [agencyId, setAgencyId] = useState("");

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewsApi.list(undefined, undefined, 1, 20),
        reviewsApi.stats(),
      ]);
      setReviews(reviewsData.items);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const selectRating = (val: number) => {
    setUserRating(val);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRating || !packageId || !agencyId) {
      setError("Please select a rating and enter package/agency details.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submit({
        packageId,
        agencyId,
        rating: userRating,
        comment: userComment || undefined,
      });
      setUserRating(0);
      setUserComment("");
      setPackageId("");
      setAgencyId("");
      setError(null);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="mt-1 text-gray-600">Share your travel experiences</p>
        </div>
      </div>

      {stats && (
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {stats.averageRating?.toFixed(1) || "0.0"}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">Average Rating</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{stats.totalReviews}</CardTitle>
                <CardDescription className="text-sm text-gray-500">Total Reviews</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {Object.values(stats.ratingDistribution || {}).filter(Boolean).length}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">Rating Breakdown</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Review */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Package ID</label>
                    <Input
                      value={packageId}
                      onChange={(e) => setPackageId(e.target.value)}
                      placeholder="Enter package ID"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Agency ID</label>
                    <Input
                      value={agencyId}
                      onChange={(e) => setAgencyId(e.target.value)}
                      placeholder="Enter agency ID"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => selectRating(r)}
                          className={cn(
                            "w-8 h-8 rounded flex items-center justify-center transition-colors",
                            userRating >= r
                              ? "bg-yellow-400 text-white"
                              : "bg-white border border-gray-300 hover:bg-yellow-100 text-gray-600"
                          )}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {userRating > 0 ? `You rated {userRating} star{userRating !== 1 ? "s" : ""}` : "Select a rating"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Comment</label>
                    <Textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!userRating || !packageId || !agencyId || submitting}
                    className="w-full"
                  >
                    {submitting ? <Send className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Submit Review
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {reviews.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No reviews yet.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-900">Traveller {review.travellerId?.slice(-6)}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <Star
                              key={r}
                              className={cn(
                                "h-3 w-3 fill-current",
                                r <= review.rating ? "text-yellow-400" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {review.status}
                        </Badge>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
  );
}
