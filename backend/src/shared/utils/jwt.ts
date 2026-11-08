import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roleKey: string;
  roleName: string;
  agencyId?: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRY as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};
