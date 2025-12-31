import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";
import { Role } from "@prisma/client";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../../utils/error/custom_error_handler";
import appConfig from "../../config/app_config";
import { generateRefreshToken, hashToken } from "@/utils/helper/token";
import { sessionRepository } from "./session.repository";
import { db } from "@/config/db";

export interface UserData {
  email: string;
  password: string;
  name?: string;
  avatarUrl?: string;
  role?: Role;
}

export const authService = {
  register: async ({ payload }: { payload: UserData }) => {
    const existingUser = await authRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new BadRequestError("User already exists", "AuthService");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await authRepository.createUser({
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
      avatarUrl: payload.avatarUrl,
      role: payload.role,
    });

    const { password: _password, ...safeUser } = user;

    return {
      ...safeUser,
    };
  },

  login: async ({
    email,
    password,
    userAgent,
    ipAddress,
  }: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }) => {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials", "AuthService");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthenticatedError("Invalid credentials", "AuthService");
    }

    const rowRefreshToken = generateRefreshToken();
    const hashedToken = hashToken(rowRefreshToken);

    const session = await sessionRepository.create({
      userId: user.id,
      userAgent,
      ipAddress,
      refreshToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, sessionId: session.id },
      appConfig.ACCESS_TOKEN_SECRET!,
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY }
    );

    const { password: _password, ...authUser } = user;

    return { user: authUser, accessToken, refreshToken: rowRefreshToken };
  },
  refresh: async (refreshToken: string) => {
    const hashedToken = hashToken(refreshToken);

    const session = await sessionRepository.findByRefreshToken(hashedToken);

    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      throw new UnauthenticatedError(
        "Invalid refresh token",
        "AuthService.refresh"
      );
    }

    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRefreshToken);

    const newSession = await db.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return await tx.session.create({
        data: {
          userId: session.userId,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          refreshToken: newHashedRefreshToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        },
      });
    });



    const accessToken = jwt.sign(
      {
        userId: session.user.id,
        role: session.user.role,
        sessionId: newSession.id,
      },
      appConfig.ACCESS_TOKEN_SECRET!,
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken: newRefreshToken };
  },
  getMe: async (userId: string) => {
    return authRepository.findById(userId)
  },
  listSessions: async (userId: string) => {
    const sessions = await sessionRepository.findActiveByUser(userId);
    return sessions;
  },
  logoutCurrent: async (sessionId: string) => {
    await sessionRepository.revoke(sessionId);
  },
  logoutBySessionId: async (sessionId: string, userId: string) => {
    const session = await sessionRepository.findSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new BadRequestError(
        "Session not found or unauthorized",
        "AuthService.logoutBySessionId"
      );
    }
    await sessionRepository.revoke(sessionId);
  },
  logoutAll: async (userId: string) => {
    await sessionRepository.revokeAll(userId);
  }
};
