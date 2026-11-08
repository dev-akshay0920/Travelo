import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { RoleRepository } from "../roles/role.repository";
import { UserRepository } from "../users/user.repository";
import { AgencyRepository } from "../agencies/agency.repository";
import { ConflictError, ValidationError, UnauthorizedError } from "../../shared/errors/app-error";
import { signAccessToken } from "../../shared/utils/jwt";
import type { SignUpPayload, SignUpResponse, SignInPayload, SignInResponse } from "./auth.types";

const SALT_ROUNDS = 12;

export const AuthService = {
  async signUp(data: SignUpPayload): Promise<SignUpResponse> {
    const { name, email, password, role, agencyName } = data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("Email is already registered.");
    }

    const roleDoc = await RoleRepository.findAssignableRole(role);
    if (!roleDoc) {
      throw new ValidationError("Invalid or unassignable role.");
    }

    if (role === "agency" && !agencyName?.trim()) {
      throw new ValidationError("Agency name is required for agency signup.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await UserRepository.create({
      roleId: roleDoc._id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: "email_password",
      status: "active",
    });

    let agency: SignUpResponse["agency"];

    if (role === "agency") {
      const existingAgency = await AgencyRepository.findByOwnerUserId(String(user._id));
      if (existingAgency) {
        agency = {
          id: String(existingAgency._id),
          name: existingAgency.name,
          slug: existingAgency.slug,
          status: existingAgency.status,
        };
      } else {
        const baseSlug = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const slug = `${baseSlug}-${String(user._id).slice(-6)}`;

        try {
          const agencyDoc = await AgencyRepository.create({
            ownerUserId: new Types.ObjectId(user._id),
            name: agencyName!.trim(),
            slug,
          });

          agency = {
            id: String(agencyDoc._id),
            name: agencyDoc.name,
            slug: agencyDoc.slug,
            status: agencyDoc.status,
          };
        } catch (error) {
          console.error("Failed to create agency profile during signup", {
            userId: user._id,
            agencyName,
            error,
          });
          throw new ConflictError("Failed to create agency profile. Please try again.");
        }
      }
    } else {
      agency = undefined;
    }

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: {
          key: roleDoc.key,
          name: roleDoc.name,
        },
      },
      agency,
    };
  },

  async signIn(data: SignInPayload): Promise<SignInResponse> {
    const { email, password } = data;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserRepository.findByEmailWithRole(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const roleKey = user.roleId?.key ?? "";
    const roleName = user.roleId?.name ?? "";

    let agencyId: string | undefined;

    if (roleKey === "agency") {
      const agency = await AgencyRepository.findByOwnerUserId(String(user._id));
      if (agency) {
        agencyId = String(agency._id);
      }
    }

    const accessToken = signAccessToken({
      sub: String(user._id),
      email: user.email,
      roleKey,
      roleName,
      agencyId,
    });

    const agency = agencyId
      ? {
          id: agencyId,
        }
      : undefined;

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: {
          key: roleKey,
          name: roleName,
        },
      },
      agency,
      accessToken,
    };
  },
};
