import { Request, Response } from "express";
import { successResponse } from "../../utils/helper/response_helper";
import appConfig from "../../config/app_config";
import { authService } from "./auth.service";

export const authController = {
  register: async (req: Request, res: Response) => {
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
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken } = await authService.login({ email, password });
    res.cookie("accessToken", accessToken, appConfig.ACCESS_COOKIE_OPTIONS);
    return successResponse(res, "User Logged In Successfully", user, 200);
  },
};
