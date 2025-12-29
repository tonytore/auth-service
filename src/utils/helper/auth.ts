import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "@/utils/error/custom_error_handler";
import { Role } from "@prisma/client";
import appConfig from "@/config/app_config";

interface AccessTokenPayload {
  userId: string;
  role: Role;
  sessionId: string;
}

const { ACCESS_TOKEN_SECRET } = appConfig;

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET!,
    ) as AccessTokenPayload;
    if (!payload.userId || !payload.role) {
      throw new Error("Invalid token payload");
    }
    return payload;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new UnauthenticatedError(
      "Invalid or expired token",
      "verifyAccessToken",
      { originalError: errorMessage },
    );
  }
}
