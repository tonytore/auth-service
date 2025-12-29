import { Role } from "@prisma/client";

export type User = {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
};

declare module "express-serve-static-core" {
  interface Request {
    user: User;
    sessionId?: string;
    userId?: string;
  }
}
