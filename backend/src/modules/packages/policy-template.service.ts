import { PolicyTemplateRepository } from "./policy-template.repository";
import { ValidationError, NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type { PolicyTemplateType } from "./policy-template.model";

export interface PolicyTemplateServiceCreateInput {
  name: string;
  type: PolicyTemplateType;
  content: string;
  agencyId: string;
}

export interface PolicyTemplateServiceUpdateInput {
  name?: string;
  type?: PolicyTemplateType;
  content?: string;
}

export const PolicyTemplateService = {
  async createTemplate(agencyId: string, input: PolicyTemplateServiceCreateInput) {
    const existing = await PolicyTemplateRepository.findMany({ agencyId, search: input.name });
    if (existing.length > 0) {
      throw new ConflictError("A template with this name already exists.");
    }

    return PolicyTemplateRepository.create({
      ...input,
      agencyId,
    });
  },

  async getTemplate(id: string, agencyId: string) {
    const template = await PolicyTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundError("Template not found.");
    }

    if (template.agencyId && template.agencyId.toString() !== agencyId) {
      throw new NotFoundError("Template not found.");
    }

    return template;
  },

  async listTemplates(agencyId: string, filters: { type?: PolicyTemplateType; search?: string } = {}) {
    const agencyTemplates = await PolicyTemplateRepository.findMany({
      agencyId,
      ...filters,
    });

    const systemTemplates = await PolicyTemplateRepository.findMany({
      agencyId: undefined,
      isDefault: true,
      ...filters,
    });

    return [...systemTemplates, ...agencyTemplates];
  },

  async updateTemplate(id: string, agencyId: string, input: PolicyTemplateServiceUpdateInput) {
    const existing = await PolicyTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Template not found.");
    }

    if (existing.agencyId && existing.agencyId.toString() !== agencyId) {
      throw new NotFoundError("Template not found.");
    }

    if (existing.isDefault) {
      throw new ValidationError("System templates cannot be edited.");
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await PolicyTemplateRepository.findMany({ agencyId, search: input.name });
      if (duplicate.length > 0) {
        throw new ConflictError("A template with this name already exists.");
      }
    }

    return PolicyTemplateRepository.update(id, input);
  },

  async deleteTemplate(id: string, agencyId: string) {
    const existing = await PolicyTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Template not found.");
    }

    if (existing.agencyId && existing.agencyId.toString() !== agencyId) {
      throw new NotFoundError("Template not found.");
    }

    if (existing.isDefault) {
      throw new ValidationError("System templates cannot be deleted.");
    }

    return PolicyTemplateRepository.delete(id);
  },

  async duplicateTemplate(id: string, agencyId: string) {
    const existing = await PolicyTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Template not found.");
    }

    const duplicateName = `${existing.name} (Copy)`;
    const duplicate = await PolicyTemplateRepository.create({
      name: duplicateName,
      type: existing.type,
      content: existing.content,
      agencyId,
    });

    return duplicate;
  },

  async seedDefaultTemplates() {
    return PolicyTemplateRepository.createDefaultTemplates();
  },
};
