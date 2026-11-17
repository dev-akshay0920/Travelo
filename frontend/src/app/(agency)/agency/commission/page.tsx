"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, IndianRupee, Users, Wallet } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { StatCard } from "@/features/agency/components/crm-ui";
import { getCommissionReportApi } from "@/features/agency/api/crm.api";
import { formatCurrency } from "@/features/agency/lib/format";

export default function AgencyCommissionReportPage() {
  const [items, setItems] = useState<{
    staffId: string;
    staffName: string;
    staffEmail: string;
    commissionRate: number;
    totalPaid: number;
    paymentCount: number;
    commission: number;
  }[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [paidFrom, setPaidFrom] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const value = await getCommissionReportApi({
        paidFrom: paidFrom || undefined,
        paidTo: paidTo || undefined,
      });
      setItems(value.items);
      setTotalCommission(value.totalCommission);
      setStaffCount(value.staffCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load commission report.");
    } finally {
      setIsLoading(false);
    }
  }, [paidFrom, paidTo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <AgencyModulePage tab="reports" title="Commission report">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error) {
    return (
      <AgencyModulePage tab="reports" title="Commission report">
        <ErrorState title="Could not load commission report" description={error} />
      </AgencyModulePage>
    );
  }

  return (
    <AgencyModulePage tab="reports" title="Commission report">
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Staff paid" value={staffCount} icon={Users} />
          <StatCard
            label="Total commission"
            value={formatCurrency(totalCommission, "INR")}
            icon={IndianRupee}
          />
          <StatCard
            label="Total collected"
            value={formatCurrency(items.reduce((s, i) => s + i.totalPaid, 0), "INR")}
            icon={Wallet}
          />
          <StatCard
            label="Avg commission rate"
            value={
              staffCount > 0
                ? `${(
                    (items.reduce((s, i) => s + i.commissionRate, 0) / staffCount) *
                    100
                  ).toFixed(1)}%`
                : "—"
            }
            icon={CreditCard}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="paid-from" className="text-caption text-muted-foreground block mb-1">
              Paid from
            </label>
            <input
              id="paid-from"
              type="date"
              className="input input-bordered w-full"
              value={paidFrom}
              onChange={(e) => setPaidFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="paid-to" className="text-caption text-muted-foreground block mb-1">
              Paid to
            </label>
            <input
              id="paid-to"
              type="date"
              className="input input-bordered w-full"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full text-left border-collapse border border-border/50">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="px-4 py-3 text-caption text-muted-foreground">Staff</th>
                <th className="px-4 py-3 text-caption text-muted-foreground">Rate</th>
                <th className="px-4 py-3 text-caption text-muted-foreground text-right">
                  Total paid
                </th>
                <th className="px-4 py-3 text-caption text-muted-foreground text-right">
                  Payments
                </th>
                <th className="px-4 py-3 text-caption text-muted-foreground text-right">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No commission data for the selected period.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.staffId}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.staffName}</div>
                      <div className="text-xs text-muted-foreground">{item.staffEmail}</div>
                    </td>
                    <td className="px-4 py-3">{item.commissionRate}%</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.totalPaid, "INR")}
                    </td>
                    <td className="px-4 py-3 text-right">{item.paymentCount}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.commission, "INR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/50 font-semibold bg-muted/50">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right">
                  {formatCurrency(
                    items.reduce((s, i) => s + i.totalPaid, 0),
                    "INR"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {items.reduce((s, i) => s + i.paymentCount, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(totalCommission, "INR")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
