import type { AuditLogDocument, AuditLogAction } from "./audit.model";

export interface AuditLogDTO {
  id: string;
  agencyId: string;
  userId?: string;
  action: AuditLogAction;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogListQuery {
  page?: number;
  limit?: number;
  action?: AuditLogAction;
  entityType?: string;
  userId?: string;
}

export interface AuditLogListResponse {
  items: AuditLogDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toAuditLogDTO(doc: AuditLogDocument): AuditLogDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    userId: doc.userId?.toString(),
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId.toString(),
    oldValues: doc.oldValues,
    newValues: doc.newValues,
    metadata: doc.metadata,
    createdAt: doc.createdAt.toISOString(),
  };
}
