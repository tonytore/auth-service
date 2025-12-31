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
      include: {
        user: true,
      },
    });
  },
  revoke: async (id: string) => {
    return db.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },
  revokeByRefreshToken: async (hashedRefreshToken: string) => {
    return db.session.updateMany({
      where: {
        refreshToken: hashedRefreshToken,
        revokedAt: null
      },
      data: { revokedAt: new Date() },
    });
  },
  findSessionById: async (id: string) => {
    return db.session.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  },

  findActiveByUser: async (userId: string) => {
    return db.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  },
  revokeAll: async (userId: string) => {
    return db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
