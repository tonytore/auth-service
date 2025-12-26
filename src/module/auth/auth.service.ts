import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";
import { Role } from "@prisma/client";
import { BadRequestError, UnauthenticatedError } from "../../utils/error/custom_error_handler";
import appConfig from "../../config/app_config";

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

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      appConfig.ACCESS_TOKEN_SECRET!,
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      appConfig.REFRESH_TOKEN_SECRET!,
      { expiresIn: appConfig.REFRESH_TOKEN_EXPIRY },
    );

    const { password: _password, ...safeUser } = user;

    return {
      ...safeUser,
      accessToken,
      refreshToken,
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
      { expiresIn: appConfig.ACCESS_TOKEN_EXPIRY },
    );

    const { password: _password, ...authUser } = user;

    return { user: authUser, accessToken };
  },
};
