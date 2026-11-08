import { apiClient } from "@/lib/api";

export interface PolicyTemplate {
  id: string;
  name: string;
  type: "terms" | "cancellation";
  content: string;
  agencyId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyTemplateCreateInput {
  name: string;
  type: "terms" | "cancellation";
  content: string;
}

export interface PolicyTemplateUpdateInput {
  name?: string;
  type?: "terms" | "cancellation";
  content?: string;
}

export async function getPolicyTemplatesApi(type?: "terms" | "cancellation", search?: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (search) params.set("search", search);

  const response = await apiClient.get<{ success: true; data: { templates: PolicyTemplate[] } }>(`/packages/templates?${params.toString()}`);
  return response.data.templates;
}

export async function getPolicyTemplateByIdApi(id: string) {
  const response = await apiClient.get<{ success: true; data: { template: PolicyTemplate } }>(`/packages/templates/${id}`);
  return response.data.template;
}

export async function createPolicyTemplateApi(input: PolicyTemplateCreateInput) {
  const response = await apiClient.post<{ success: true; data: { template: PolicyTemplate } }>("/packages/templates", { body: input });
  return response.data.template;
}

export async function updatePolicyTemplateApi(id: string, input: PolicyTemplateUpdateInput) {
  const response = await apiClient.put<{ success: true; data: { template: PolicyTemplate } }>(`/packages/templates/${id}`, { body: input });
  return response.data.template;
}

export async function deletePolicyTemplateApi(id: string) {
  const response = await apiClient.delete<{ success: true; data: { success: boolean } }>(`/packages/templates/${id}`);
  return response.data.success;
}

export async function duplicatePolicyTemplateApi(id: string) {
  const response = await apiClient.post<{ success: true; data: { template: PolicyTemplate } }>(`/packages/templates/${id}/duplicate`, { body: {} });
  return response.data.template;
}
