"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { DetailRow, StatusPill } from "@/features/agency/components/crm-ui";
import {
  cancelSubscriptionApi,
  createSubscriptionApi,
  getMySubscriptionApi,
  listSubscriptionPlansApi,
  reactivateSubscriptionApi,
  recordSubscriptionPaymentApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import {
  titleCase,
  type AgencySubscription,
  type SubscriptionPlan,
} from "@/features/agency/types/crm.types";

export default function AgencyBillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<AgencySubscription | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payment, setPayment] = useState({ amount: "", method: "upi", reference: "" });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextPlans, nextSubscription] = await Promise.all([
        listSubscriptionPlansApi(),
        getMySubscriptionApi(),
      ]);
      setPlans(nextPlans.items);
      setSubscription(nextSubscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load billing.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const activePlan = plans.find((plan) => plan.id === subscription?.planId);

  const handleChoosePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Subscribe to ${plan.name} billed ${cycle}?`)) return;
    setBusyPlanId(plan.id);
    try {
      await createSubscriptionApi({ planId: plan.id, billingCycle: cycle, autoRenew: true });
      toast.success("Subscription created.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create subscription.");
    } finally {
      setBusyPlanId(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    if (!window.confirm("Cancel this subscription at the end of the current period?")) return;
    try {
      await cancelSubscriptionApi(subscription.id, true);
      toast.success("Subscription will not renew.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel subscription.");
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    try {
      await reactivateSubscriptionApi(subscription.id);
      toast.success("Subscription reactivated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate subscription.");
    }
  };

  const handleRecordPayment = async () => {
    if (!subscription) return;
    const amount = Number(payment.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setIsPaying(true);
    try {
      await recordSubscriptionPaymentApi(subscription.id, {
        amount,
        method: payment.method,
        reference: payment.reference.trim() || undefined,
      });
      toast.success("Payment recorded.");
      setIsPaymentOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="billing" title="Billing">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error) {
    return (
      <AgencyModulePage tab="billing" title="Billing">
        <ErrorState
          title="Could not load billing"
          description={error}
          action={
            <Button variant="outline" onClick={load}>
              Retry
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  return (
    <AgencyModulePage
      tab="billing"
      title="Billing"
      description="Manage your Travora subscription."
    >
      <PageStack>
        <Card>
          <CardHeader>
            <CardTitle>Current subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-xl font-semibold">
                      {subscription.planName ?? activePlan?.name ?? "Plan"}
                    </p>
                    <StatusPill status={subscription.status} />
                    <span className="text-body-sm capitalize text-muted-foreground">
                      {subscription.billingCycle} billing
                    </span>
                  </div>
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <DetailRow
                      label="Period start"
                      value={formatDate(subscription.currentPeriodStart)}
                    />
                    <DetailRow
                      label="Period end"
                      value={formatDate(subscription.currentPeriodEnd)}
                    />
                    <DetailRow
                      label="Next billing"
                      value={formatDate(subscription.nextBillingAt)}
                    />
                    <DetailRow label="Auto renew" value={subscription.autoRenew ? "Yes" : "No"} />
                    <DetailRow
                      label="Last payment"
                      value={
                        subscription.lastPaymentAmount
                          ? formatCurrency(
                              subscription.lastPaymentAmount,
                              activePlan?.currency ?? "INR",
                            )
                          : "-"
                      }
                    />
                    <DetailRow
                      label="Cancels at period end"
                      value={subscription.cancelAtPeriodEnd ? "Yes" : "No"}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setIsPaymentOpen(true)}>
                      <CreditCard className="size-4" aria-hidden="true" />
                      Record payment
                    </Button>
                    {subscription.cancelAtPeriodEnd ||
                    subscription.status === "cancelled" ? (
                      <Button variant="outline" onClick={handleReactivate}>
                        <Sparkles className="size-4" aria-hidden="true" />
                        Reactivate
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="size-4" aria-hidden="true" />
                        Cancel renewal
                      </Button>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-caption uppercase text-muted-foreground">Plan limits</p>
                  {activePlan ? (
                    <div className="mt-2 space-y-1 text-body-sm">
                      <DetailRow label="Staff" value={activePlan.limits.maxStaff} />
                      <DetailRow label="Leads / month" value={activePlan.limits.maxLeadsPerMonth} />
                      <DetailRow
                        label="Bookings / month"
                        value={activePlan.limits.maxBookingsPerMonth}
                      />
                      <DetailRow label="Storage (GB)" value={activePlan.limits.maxStorageGB} />
                    </div>
                  ) : (
                    <p className="mt-2 text-body-sm text-muted-foreground">
                      Plan details unavailable.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                Your agency has no subscription yet. Choose a plan below to get started.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Available plans</h2>
            <p className="text-body-sm text-muted-foreground">
              Payments are recorded manually until a payment gateway is connected.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border p-1">
            {(["monthly", "yearly"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={cycle === option ? "default" : "ghost"}
                onClick={() => setCycle(option)}
              >
                {titleCase(option)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.planId === plan.id;
            const price = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            return (
              <Card key={plan.id} className={plan.isPopular ? "border-primary/50" : undefined}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.isPopular && <StatusPill status="popular" />}
                  </div>
                  {plan.description && (
                    <p className="text-body-sm text-muted-foreground">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-heading text-2xl font-semibold">
                      {formatCurrency(price, plan.currency)}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      per {cycle === "monthly" ? "month" : "year"}
                    </p>
                  </div>
                  <ul className="space-y-2 text-body-sm">
                    {plan.features
                      .filter((feature) => feature.included)
                      .slice(0, 6)
                      .map((feature) => (
                        <li key={feature.key} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || busyPlanId === plan.id}
                    onClick={() => handleChoosePlan(plan)}
                  >
                    {busyPlanId === plan.id && (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    )}
                    {isCurrent ? "Current plan" : "Choose plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageStack>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record subscription payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sub-payment-amount">Amount</Label>
              <Input
                id="sub-payment-amount"
                type="number"
                min={0}
                value={payment.amount}
                onChange={(event) =>
                  setPayment((current) => ({ ...current, amount: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select
                value={payment.method}
                onValueChange={(value) =>
                  setPayment((current) => ({ ...current, method: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["upi", "card", "bank_transfer", "cash", "other"].map((method) => (
                    <SelectItem key={method} value={method}>
                      {titleCase(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub-payment-reference">Reference</Label>
              <Input
                id="sub-payment-reference"
                value={payment.reference}
                onChange={(event) =>
                  setPayment((current) => ({ ...current, reference: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={isPaying}>
              {isPaying && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Record payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
