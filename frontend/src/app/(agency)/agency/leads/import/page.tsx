"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { EmptyBlock } from "@/features/agency/components/crm-ui";
import { bulkImportLeadsApi, type AgencyLeadInput } from "@/features/agency/api/crm.api";
import { downloadCsv } from "@/features/agency/lib/format";

const HEADERS = ["name", "email", "phone", "travelers", "travelDate", "value", "message"] as const;

type ParsedRow = AgencyLeadInput & { rowNumber: number };

function parseCsv(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { rows: [], errors: ["Paste at least one row."] };

  const errors: string[] = [];
  const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;
  const rows: ParsedRow[] = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const character of line) {
      if (character === '"') {
        inQuotes = !inQuotes;
      } else if (character === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += character;
      }
    }
    cells.push(current.trim());

    const [name, email, phone, travelers, travelDate, value, message] = cells;
    if (!name || !email) {
      errors.push(`Row ${index + 1}: name and email are required.`);
      continue;
    }
    rows.push({
      rowNumber: index + 1,
      travelerName: name,
      travelerEmail: email,
      travelerPhone: phone || undefined,
      travelerCount: travelers ? Number(travelers) : undefined,
      requestedStartDate: travelDate || undefined,
      estimatedValue: value ? Number(value) : undefined,
      message: message || undefined,
    });
  }

  return { rows, errors };
}

export default function AgencyLeadImportPage() {
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    failed: number;
    errors: Array<{ email: string; message: string }>;
  } | null>(null);

  const handlePreview = () => {
    const parsed = parseCsv(csv);
    setRows(parsed.rows);
    setErrors(parsed.errors);
    setResult(null);
  };

  const handleImport = async () => {
    if (rows.length === 0) {
      toast.error("Preview your rows before importing.");
      return;
    }
    setIsImporting(true);
    try {
      const payload = rows.map(({ rowNumber, ...row }) => {
        void rowNumber;
        return row;
      });
      const value = await bulkImportLeadsApi(payload);
      setResult(value);
      toast.success(`Imported ${value.created} leads.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    downloadCsv("leads-template.csv", [
      {
        name: "Asha Rao",
        email: "asha@example.com",
        phone: "+91 98765 43210",
        travelers: 2,
        travelDate: "2027-02-14",
        value: 85000,
        message: "Bali honeymoon, 5 nights",
      },
    ]);
  };

  return (
    <AgencyModulePage
      tab="leads"
      title="Import leads"
      description="Upload a CSV export to bring inquiries in bulk."
      actions={
        <Button variant="outline" asChild>
          <Link href="/agency/leads">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to leads
          </Link>
        </Button>
      }
    >
      <PageStack>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CSV data</CardTitle>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <FileUp className="size-4" aria-hidden="true" />
              Download template
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-body-sm text-muted-foreground">
              Column order: {HEADERS.join(", ")}. Keep the header row; it is ignored.
            </p>
            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={"name,email,phone,travelers,travelDate,value,message\nAsha Rao,asha@example.com,+91 98765 43210,2,2027-02-14,85000,Bali honeymoon"}
              className="flex min-h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePreview}>
                Preview rows
              </Button>
              <Button type="button" onClick={handleImport} disabled={isImporting || rows.length === 0}>
                {isImporting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                Import {rows.length} leads
              </Button>
            </div>
            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-body-sm font-medium text-destructive">Fix these rows first</p>
                <ul className="mt-1 list-disc pl-5 text-caption text-muted-foreground">
                  {errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview ({rows.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-auto rounded-lg border border-border">
                <table className="w-full text-body-sm">
                  <thead className="bg-muted/50 text-left text-caption uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Travelers</th>
                      <th className="px-3 py-2">Travel date</th>
                      <th className="px-3 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.rowNumber}-${row.travelerEmail}`} className="border-t border-border/60">
                        <td className="px-3 py-2">{row.travelerName}</td>
                        <td className="px-3 py-2">{row.travelerEmail}</td>
                        <td className="px-3 py-2">{row.travelerPhone ?? "-"}</td>
                        <td className="px-3 py-2">{row.travelerCount ?? "-"}</td>
                        <td className="px-3 py-2">{row.requestedStartDate ?? "-"}</td>
                        <td className="px-3 py-2">{row.estimatedValue ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Import result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-body-sm">
                Created {result.created} leads. Failed {result.failed}.
              </p>
              {result.errors.length > 0 && (
                <ul className="list-disc pl-5 text-caption text-muted-foreground">
                  {result.errors.map((item) => (
                    <li key={`${item.email}-${item.message}`}>
                      {item.email}: {item.message}
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild>
                <Link href="/agency/leads">View leads</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {rows.length === 0 && !result && (
          <EmptyBlock
            title="Nothing to import yet"
            description="Paste CSV rows above and preview them before importing."
          />
        )}
      </PageStack>
    </AgencyModulePage>
  );
}
