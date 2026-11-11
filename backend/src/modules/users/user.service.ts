import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../shared/errors/app-error";
import { UserRepository } from "./user.repository";
import type { UpdateMyProfileInput } from "./user.validation";

export interface MyProfileDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

async function getActiveTraveller(userId: string) {
  const user = await UserRepository.findByIdWithRole(userId);
  if (!user || user.status !== "active") {
    throw new UnauthorizedError();
  }
  if (user.roleId?.key !== "traveller") {
    throw new ForbiddenError("Traveler access is required.");
  }
  return user;
}

function toMyProfileDTO(user: {
  _id: unknown;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
}): MyProfileDTO {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export const UserService = {
  async getMyProfile(userId: string): Promise<MyProfileDTO> {
    const user = await getActiveTraveller(userId);
    return toMyProfileDTO(user);
  },

  async updateMyProfile(userId: string, input: UpdateMyProfileInput): Promise<MyProfileDTO> {
    await getActiveTraveller(userId);
    const user = await UserRepository.updateName(userId, input.name);
    if (!user) {
      throw new NotFoundError("Profile not found.");
    }
    return toMyProfileDTO(user);
  },
};
