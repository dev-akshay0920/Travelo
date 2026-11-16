"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getLeadPipelinesApi, createLeadPipelineApi, updateLeadPipelineApi, deleteLeadPipelineApi } from "@/features/leads/api/leads.api";
import type { LeadPipeline } from "@/features/leads/types/lead.types";
import type { ReactNode } from "react";

interface LeadPipelineGridProps {
  agencyId: string;
}

export function LeadPipelineGrid({ agencyId }: LeadPipelineGridProps): ReactNode {
  const [pipelines, setPipelines] = useState<LeadPipeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<LeadPipeline | null>(null);
  const [newPipeline, setNewPipeline] = useState({ name: "", color: "#6B7280", isDefault: false, isClosedWon: false, isClosedLost: false });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPipelines = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getLeadPipelinesApi({ page, limit: 20 });
      setPipelines((current) => (page === 1 ? result.items : [...current, ...result.items]));
      setTotal(result.total);
      setHasMore(result.page < result.totalPages);
    } catch (err) {
      toast.error("Failed to load pipeline stages");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPipelines();
  }, [loadPipelines]);

  const openCreateDialog = () => {
    setEditingPipeline(null);
    setNewPipeline({ name: "", color: "#6B7280", isDefault: false, isClosedWon: false, isClosedLost: false });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pipeline: LeadPipeline) => {
    setEditingPipeline(pipeline);
    setNewPipeline({
      name: pipeline.name,
      color: pipeline.color,
      isDefault: pipeline.isDefault,
      isClosedWon: pipeline.isClosedWon,
      isClosedLost: pipeline.isClosedLost,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPipeline) {
        await updateLeadPipelineApi(editingPipeline.id, {
          name: newPipeline.name,
          color: newPipeline.color,
          isDefault: newPipeline.isDefault,
          isClosedWon: newPipeline.isClosedWon,
          isClosedLost: newPipeline.isClosedLost,
        });
        toast.success("Pipeline stage updated");
      } else {
        await createLeadPipelineApi({
          name: newPipeline.name,
          color: newPipeline.color,
          isDefault: newPipeline.isDefault,
          isClosedWon: newPipeline.isClosedWon,
          isClosedLost: newPipeline.isClosedLost,
        });
        toast.success("Pipeline stage created");
      }
      setIsDialogOpen(false);
      loadPipelines();
    } catch (err) {
      toast.error(editingPipeline ? "Failed to update pipeline stage" : "Failed to create pipeline stage");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pipeline stage?")) return;
    try {
      await deleteLeadPipelineApi(id);
      toast.success("Pipeline stage deleted");
      loadPipelines();
    } catch (err) {
      toast.error("Failed to delete pipeline stage");
    }
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Pipeline Stages</h2>
          <p className="text-sm text-muted-foreground">Define your lead pipeline stages for tracking inquiries</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> New Stage
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Kanban className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p className="text-body-sm">No pipeline stages yet. Create your first one.</p>
        </div>
      ) : (


        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pipeline.color }} />
                    <h4 className="font-semibold">{pipeline.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(pipeline)} className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(pipeline.id)} className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${pipeline.isDefault ? "ring-2 ring-primary" : ""}`} />
                    Default
                  </span>
                  <span className={`w-2 h-2 rounded-full ${pipeline.isClosedWon ? "bg-emerald-500" : ""}`} />
                  Won
                  <span className={`w-2 h-2 rounded-full ${pipeline.isClosedLost ? "bg-red-500" : ""}`} />
                  Lost
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleLoadMore}>Load more</Button>
            </div>
          )}
        </>
      )}


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPipeline ? "Edit Pipeline Stage" : "New Pipeline Stage"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Stage Name</Label>
              <Input
                id="name"
                value={newPipeline.name}
                onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
                placeholder="e.g. New, Contacted, Qualified"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select value={newPipeline.color} onValueChange={(v) => setNewPipeline({ ...newPipeline, color: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    { value: "#6B7280", label: "Gray" },
                    { value: "#3B82F6", label: "Blue" },
                    { value: "#10B981", label: "Green" },
                    { value: "#EF4444", label: "Red" },
                    { value: "#F59E0B", label: "Amber" },
                    { value: "#8B5CF6", label: "Purple" },
                  ].map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label>Won Stage</Label>
                <Select value={newPipeline.isClosedWon ? "yes" : "no"} onValueChange={(v) => setNewPipeline({ ...newPipeline, isClosedWon: v === "yes" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Lost Stage</Label>
                <Select value={newPipeline.isClosedLost ? "yes" : "no"} onValueChange={(v) => setNewPipeline({ ...newPipeline, isClosedLost: v === "yes" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPipeline ? "Update" : "Create"} Stage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}