"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const response_helper_1 = require("../../utils/helper/response_helper");
const auth_service_1 = require("./auth.service");
const catch_async_1 = __importDefault(require("@/utils/helper/catch_async"));
const logger_1 = require("@/utils/logger/logger");
const app_config_1 = __importDefault(require("@/config/app_config"));
exports.authController = {
  register: (0, catch_async_1.default)(async (req, res) => {
    const { email, password, name, avatarUrl, role } = req.body;
    const payload = {
      email,
      password,
      name,
      avatarUrl,
      role,
    };
    const user = await auth_service_1.authService.register({ payload });
    return (0, response_helper_1.successResponse)(
      res,
      "User Registered Successfully",
      user,
      201,
    );
  }),
  login: (0, catch_async_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } =
      await auth_service_1.authService.login({
        email,
        password,
      });
    res.cookie(
      "accessToken",
      accessToken,
      app_config_1.default.ACCESS_COOKIE_OPTIONS,
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return (0, response_helper_1.successResponse)(
      res,
      "User Logged In Successfully",
      user,
      200,
    );
  }),
  listAllUsers: (0, catch_async_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const user = await auth_service_1.authService.getUserService(userId);
    logger_1.logger.info("User List", user);
    return (0, response_helper_1.successResponse)(res, "User List", user);
  }),
};
