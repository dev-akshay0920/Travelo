"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLeadApi } from "@/features/leads/api/leads.api";

type InquiryFormDialogProps = {
  agencyId: string;
  packageId?: string;
  packageName?: string;
  className?: string;
  size?: "default" | "sm";
};

export function InquiryFormDialog({
  agencyId,
  packageId,
  packageName,
  className,
  size = "default",
}: InquiryFormDialogProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [requestedStartDate, setRequestedStartDate] = useState("");
  const [travelerCount, setTravelerCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openDialog = () => {
    setIsAuthenticated(Boolean(window.localStorage.getItem("travora_access_token")));
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createLeadApi({
        agencyId,
        ...(packageId ? { packageId } : {}),
        message: message.trim(),
        ...(requestedStartDate ? { requestedStartDate } : {}),
        ...(travelerCount ? { travelerCount: Number(travelerCount) } : {}),
      });
      toast.success("Your inquiry was sent to the agency.");
      setMessage("");
      setRequestedStartDate("");
      setTravelerCount("");
      setOpen(false);
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : "Could not send your inquiry.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectTo = encodeURIComponent(pathname || "/packages");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={openDialog}
      >
        <MessageSquareText aria-hidden="true" />
        Ask about {packageName ? "this package" : "this agency"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader>
            <div className="border-b border-border px-6 py-5">
              <DialogTitle>Send an inquiry</DialogTitle>
              <DialogDescription className="mt-1">
                {packageName
                  ? `Ask the agency about ${packageName}.`
                  : "Ask the agency about its services or travel options."}
              </DialogDescription>
            </div>
          </DialogHeader>

          {!isAuthenticated ? (
            <DialogBody className="space-y-4 p-6">
              <p className="text-body-sm text-muted-foreground">
                Sign in to send an inquiry. Your name and account email will be shared with the
                agency so it can respond.
              </p>
              <Button asChild>
                <Link href={`/signin?redirectTo=${redirectTo}`}>Sign in to continue</Link>
              </Button>
              <p className="text-body-sm text-muted-foreground">
                New to Travora?{" "}
                <Link className="font-medium text-primary hover:underline" href={`/signup?redirectTo=${redirectTo}`}>
                  Create an account
                </Link>
              </p>
            </DialogBody>
          ) : (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <DialogBody className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-message">Your message</Label>
                  <Textarea
                    id="lead-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    minLength={10}
                    maxLength={2000}
                    required
                    placeholder="Tell the agency what you would like to know..."
                  />
                  <p className="text-caption text-muted-foreground">{message.length}/2000</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-start-date">Preferred start date (optional)</Label>
                    <Input
                      id="lead-start-date"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={requestedStartDate}
                      onChange={(event) => setRequestedStartDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-traveler-count">Travelers (optional)</Label>
                    <Input
                      id="lead-traveler-count"
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      inputMode="numeric"
                      value={travelerCount}
                      onChange={(event) => setTravelerCount(event.target.value)}
                    />
                  </div>
                </div>
                {error && (
                  <p role="alert" className="text-body-sm text-destructive">
                    {error}
                  </p>
                )}
              </DialogBody>
              <DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || message.trim().length < 10}>
                  {isSubmitting ? "Sending..." : "Send inquiry"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
