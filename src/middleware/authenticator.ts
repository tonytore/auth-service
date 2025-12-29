import { UnauthenticatedError } from "@/utils/error/custom_error_handler";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/utils/logger/logger";
import { verifyAccessToken } from "@/utils/helper/auth";
import { db } from "@/config/db";

import catchAsync from "@/utils/helper/catch_async";

export const authMiddleware = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      throw new UnauthenticatedError(
        "Authentication required",
        "AuthMiddleware",
      );
    }

    const payload = verifyAccessToken(accessToken);

    // 🔒 Re-check user existence
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new UnauthenticatedError("User no longer exists", "AuthMiddleware");
    }

    req.user = {
      ...user,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    };
    next();
  },
);

export async function optAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return next();
  }

  const token = accessToken;

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    return next();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    logger.info("optAuth: token verify failed — continuing unauthenticated", {
      message: errorMessage,
    });

    return next();
  }
}
