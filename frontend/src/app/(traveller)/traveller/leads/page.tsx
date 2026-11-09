"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Clock, Users, Timer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  packageName: string;
  destination: string;
  agencyName: string;
  status: "pending" | "contacted" | "responded" | "converted" | "closed";
  createdAt: string;
  lastMessageAt?: string;
  travelers: number;
  budget?: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  responded: "Responded",
  converted: "Converted",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  contacted: "bg-blue-50 text-blue-700 border-blue-100",
  responded: "bg-emerald-50 text-emerald-700 border-emerald-100",
  converted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  closed: "bg-gray-50 text-gray-700 border-gray-100",
};

export default function TravellerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      packageName: "Ladakh Grand Traverse",
      destination: "Leh, Ladakh",
      agencyName: "Himalayan Horizon",
      status: "responded",
      createdAt: "2026-10-20",
      lastMessageAt: "2026-10-22",
      travelers: 2,
      budget: 45000,
    },
    {
      id: "2",
      packageName: "Goa Beach Escape",
      destination: "Panaji, Goa",
      agencyName: "Wanderlust Trails",
      status: "pending",
      createdAt: "2026-10-25",
      travelers: 4,
    },
    {
      id: "3",
      packageName: "Kerala Backwaters",
      destination: "Kochi, Kerala",
      agencyName: "Kerala Coast & Country",
      status: "contacted",
      createdAt: "2026-10-18",
      travelers: 2,
      budget: 28000,
    },
  ]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
          <p className="mt-1 text-gray-600">
            Track your travel inquiries and agency responses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Inquiry</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{leads.length}</CardTitle>
              <Badge variant="outline">Total Leads</Badge>
            </CardHeader>
            <CardContent className="text-gray-500">Inquiries sent to agencies</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {leads.filter((l) => l.status === "responded").length}
              </CardTitle>
              <Badge variant="outline">Responses</Badge>
            </CardHeader>
            <CardContent className="text-gray-500">Agencies that replied</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {leads.filter((l) => l.status === "pending").length}
              </CardTitle>
              <Badge variant="outline">Pending</Badge>
            </CardHeader>
            <CardContent className="text-gray-500">Awaiting agency reply</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {leads.filter((l) => l.status === "converted").length}
              </CardTitle>
              <Badge variant="outline">Converted</Badge>
            </CardHeader>
            <CardContent className="text-gray-500">Trips booked</CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search leads..."
                className="h-10 w-full sm:w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No leads yet</h3>
              <p className="text-gray-500 max-w-md mt-2">
                Send an inquiry from a package page to start a conversation with an agency.
              </p>
              <Button variant="outline" onClick={() => {}} className="mt-6">
                Browse Packages
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{lead.packageName}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{lead.destination}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{lead.agencyName}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={STATUS_COLORS[lead.status]}>
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {lead.travelers} {lead.travelers === 1 ? "traveler" : "travelers"}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-600">{lead.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </>
  );
}
