"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
const custom_error_handler_1 = require("../../utils/error/custom_error_handler");
const app_config_1 = __importDefault(require("../../config/app_config"));
const token_1 = require("@/utils/helper/token");
const session_repository_1 = require("./session.repository");
exports.authService = {
  register: async ({ payload }) => {
    const existingUser = await auth_repository_1.authRepository.findByEmail(
      payload.email,
    );
    if (existingUser) {
      throw new custom_error_handler_1.BadRequestError(
        "User already exists",
        "AuthService",
      );
    }
    const hashedPassword = await bcrypt_1.default.hash(payload.password, 10);
    const user = await auth_repository_1.authRepository.createUser({
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
  login: async ({ email, password }) => {
    const user = await auth_repository_1.authRepository.findByEmail(email);
    if (!user) {
      throw new custom_error_handler_1.UnauthenticatedError(
        "Invalid credentials",
        "AuthService",
      );
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
      throw new custom_error_handler_1.UnauthenticatedError(
        "Invalid credentials",
        "AuthService",
      );
    }
    const accessToken = jsonwebtoken_1.default.sign(
      { userId: user.id, role: user.role },
      app_config_1.default.ACCESS_TOKEN_SECRET,
      { expiresIn: app_config_1.default.ACCESS_TOKEN_EXPIRY },
    );
    const rowRefreshToken = (0, token_1.generateRefreshToken)();
    const hashedToken = (0, token_1.hashToken)(rowRefreshToken);
    await session_repository_1.sessionRepository.create({
      userId: user.id,
      refreshToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });
    const { password: _password, ...authUser } = user;
    return { user: authUser, accessToken, refreshToken: rowRefreshToken };
  },
  getUserService: async (userId) => {
    const users = await auth_repository_1.authRepository.listUserRepository();
    users.filter((user) => user.id === userId);
    return users;
  },
};
