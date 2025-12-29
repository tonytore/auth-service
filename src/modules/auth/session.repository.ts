import { db } from "@/config/db";

export const sessionRepository = {
  create: async (data: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) => {
    return db.session.create({
      data,
    });
  },

  findByRefreshToken: async (refreshToken: string) => {
    return db.session.findUnique({
      where: { refreshToken },
    });
  },
  revokeSession: async (id: string) => {
    return db.session.update({
      where: { id },
      data: { isRevoked: true },
    });
  },
};
