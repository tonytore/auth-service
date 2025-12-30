import { UnauthenticatedError } from "@/utils/error/custom_error_handler";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/utils/logger/logger";
import { verifyAccessToken } from "@/utils/helper/auth";

import catchAsync from "@/utils/helper/catch_async";
import { authRepository } from "@/modules/auth/auth.repository";

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
    const session = await authRepository.findSessionById(payload.sessionId);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthenticatedError(
        "Session is no longer valid or expired or revoked",
        "AuthMiddleware",
      );
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    req.sessionId = payload.sessionId;
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
