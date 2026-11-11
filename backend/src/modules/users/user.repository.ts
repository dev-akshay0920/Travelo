import { Types } from "mongoose";
import type { UserDocument } from "./user.model";
import { User } from "./user.model";

export interface UserCreateInput {
  roleId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  authProvider?: "email_password" | "google";
  googleId?: string;
  status?: string;
}

export const UserRepository = {
  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await User.findById(id).exec()) as Promise<UserDocument | null>;
  },

  async findByIdWithRole(
    id: string
  ): Promise<(UserDocument & { roleId: { key: string; name: string } }) | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await User.findById(id)
      .populate("roleId", "key name")
      .exec()) as Promise<UserDocument & { roleId: { key: string; name: string } } | null>;
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await User.findOne({ email }).exec()) as Promise<UserDocument | null>;
  },

  async findByEmailWithRole(
    email: string
  ): Promise<(UserDocument & { roleId: { key: string; name: string } }) | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await User.findOne({ email })
      .populate("roleId", "key name")
      .exec()) as Promise<UserDocument & { roleId: { key: string; name: string } } | null>;
  },

  async findByGoogleId(googleId: string): Promise<(UserDocument & { roleId: { key: string; name: string } }) | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await User.findOne({ googleId })
      .populate("roleId", "key name")
      .exec()) as Promise<UserDocument & { roleId: { key: string; name: string } } | null>;
  },

  async create(data: UserCreateInput): Promise<UserDocument> {
    const user = new User(data);
    return user.save();
  },

  async update(id: string, data: { googleId?: string; authProvider?: "email_password" | "google" }): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user id");
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  },

  async updateName(id: string, name: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return User.findOneAndUpdate(
      { _id: new Types.ObjectId(id), status: "active" },
      { $set: { name } },
      { new: true, runValidators: true }
    )
      .select("name email emailVerified createdAt")
      .exec();
  },
};
