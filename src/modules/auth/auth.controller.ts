import { Request, Response } from "express";
import { successResponse } from "../../utils/helper/response_helper";
import { authService } from "./auth.service";
import catchAsync from "@/utils/helper/catch_async";
import { logger } from "@/utils/logger/logger";
import appConfig from "@/config/app_config";

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
    return successResponse(res, "User Logged In Successfully", user, 200);
  }),
  listAllUsers: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await authService.getUserService(userId);
    logger.info("User List", user);
    return successResponse(res, "User List", user);
  }),
};
