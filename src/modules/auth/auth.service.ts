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

  login: async ({ email, password }: { email: string; password: string }) => {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials", "AuthService");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthenticatedError("Invalid credentials", "AuthService");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      appConfig.ACCESS_TOKEN_SECRET!,
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY }
    );

    const rowRefreshToken = generateRefreshToken();
    const hashedToken = hashToken(rowRefreshToken);

    await sessionRepository.create({
      userId: user.id,
      refreshToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    const { password: _password, ...authUser } = user;

    return { user: authUser, accessToken, refreshToken: rowRefreshToken };
  },
  getUserService: async (userId: string) => {
    const users = await authRepository.listUserRepository();
    users.filter((user) => user.id === userId);
    return users;
  },
  refresh: async (refreshToken: string) => {
    const hashedToken = hashToken(refreshToken);
    const session = await sessionRepository.findByRefreshToken(hashedToken);

    if (!session) {
      throw new UnauthenticatedError(
        "Invalid refresh token",
        "AuthService.refresh"
      );
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthenticatedError(
        "Refresh token expired",
        "AuthService.refresh"
      );
    }

    await sessionRepository.revokeSession(session.id);
    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRefreshToken);

    await sessionRepository.create({
      userId: session.userId,
      refreshToken: newHashedRefreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    const accessToken = jwt.sign(
      { userId: session.user.id, role: session.user.role },
      appConfig.ACCESS_TOKEN_SECRET!,
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken: newRefreshToken };
  },
  logout: async (refreshToken: string) => {
    if (!refreshToken) {
      throw new UnauthenticatedError("No refresh token provided", "AuthService");
    }
    
    const hashedToken = hashToken(refreshToken);
    await sessionRepository.revokedSessionByToken(hashedToken);
  }
};
