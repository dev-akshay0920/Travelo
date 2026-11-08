import type { RoleDocument } from "./role.model";
import { Role } from "./role.model";
import { RoleRepository } from "./role.repository";

const DEFAULT_ROLES = [
  {
    key: "traveller" as const,
    name: "Traveller",
    description: "A customer who discovers and interacts with travel agencies and packages.",
    isAssignableDuringSignup: true,
  },
  {
    key: "agency" as const,
    name: "Agency",
    description: "A travel agency representative who manages agency-related functionality.",
    isAssignableDuringSignup: true,
  },
  {
    key: "admin" as const,
    name: "Administrator",
    description: "Platform administrator.",
    isAssignableDuringSignup: false,
  },
];

export const RoleService = {
  async findAssignableRole(key: string): Promise<RoleDocument | null> {
    return RoleRepository.findAssignableRole(key);
  },

  async findById(id: string): Promise<RoleDocument | null> {
    return RoleRepository.findById(id);
  },

  async findAll(): Promise<RoleDocument[]> {
    return RoleRepository.findAll();
  },

  async seedDefaults(): Promise<void> {
    for (const roleData of DEFAULT_ROLES) {
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      await Role.findOneAndUpdate(
        { key: roleData.key },
        { $setOnInsert: { ...roleData, isActive: true } },
        { upsert: true, new: true }
      );
    }
  },
};
