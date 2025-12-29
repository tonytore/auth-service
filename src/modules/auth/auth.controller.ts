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
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
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
};
