declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        sub: string;
        email: string;
        roleKey: string;
        roleName: string;
        agencyId?: string;
      };
    }
  }
}

export {};