import { Request, Response } from "express";
import { successResponse } from "../../utils/helper/response_helper";
import { authService } from "./auth.service";
import catchAsync from "@/utils/helper/catch_async";
import { logger } from "@/utils/logger/logger";
import appConfig from "@/config/app_config";
import { UnauthenticatedError } from "@/utils/error/custom_error_handler";

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const { email, password, name, avatarUrl, role } = req.body;
    const payload = {
      email,
      password,
      name,
      avatarUrl,
      role,
    };

    const user = await authService.register({ payload });

    return successResponse(res, "User Registered Successfully", user, 201);
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
      userAgent,
      ipAddress,
    });
    res.cookie("accessToken", accessToken, appConfig.ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return successResponse(
      res,
      "User Logged In Successfully",
      {
        data: {
          user
        },
      },
      200
    );
  }),
  getMe: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await authService.getUserService(userId);
    logger.info("User List", user);
    return successResponse(res, "User List", user);
  }),
  refresh: catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthenticatedError(
        "No refresh token provided",
        "AuthController"
      );
    }
    const tokens = await authService.refresh(refreshToken);
    res.cookie(
      "accessToken",
      tokens.accessToken,
      appConfig.ACCESS_COOKIE_OPTIONS
    );
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return successResponse(res, "Tokens refreshed successfully", null, 200);
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    await authService.logout(req.sessionId!);
    res.clearCookie("accessToken");
    return successResponse(res, "User logged out successfully", null, 200);
  }),
  listSessions: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessions = await authService.listSessions(userId!);
    return successResponse(res, "User Sessions Retrieved Successfully", sessions);
  }),
  logoutCurrent: catchAsync(async (req: Request, res: Response) => {
    await authService.logout(req.sessionId!);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return successResponse(res, "Current session logged out successfully", null, 200);
  }),
  logoutBySessionId: catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    await authService.logoutBySessionId(sessionId,userId);
    return successResponse(res, "Session logged out successfully", null, 200);
  }),
  logoutAll: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await authService.logoutAll(userId!);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return successResponse(res, "All sessions logged out successfully", null, 200);
  }),
};
