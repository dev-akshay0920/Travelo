import type { RoleDocument } from "./role.model";
import { Role } from "./role.model";

export const RoleRepository = {
  async findById(id: string): Promise<RoleDocument | null> {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Role.findById(id).exec()) as Promise<RoleDocument | null>;
  },

  async findByKey(key: string): Promise<RoleDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Role.findOne({ key: key.toLowerCase() }).exec()) as Promise<RoleDocument | null>;
  },

  async findAssignableRole(key: string): Promise<RoleDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Role.findOne({
      key: key.toLowerCase(),
      isActive: true,
      isAssignableDuringSignup: true,
    }).exec()) as Promise<RoleDocument | null>;
  },

  async findAll(): Promise<RoleDocument[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Role.find().exec()) as Promise<RoleDocument[]>;
  },
};
