"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const custom_error_handler_1 = require("@/utils/error/custom_error_handler");
const app_config_1 = __importDefault(require("@/config/app_config"));
const { ACCESS_TOKEN_SECRET } = app_config_1.default;
function verifyAccessToken(token) {
  try {
    const payload = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    if (!payload.userId || !payload.role) {
      throw new Error("Invalid token payload");
    }
    return payload;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new custom_error_handler_1.UnauthenticatedError(
      "Invalid or expired token",
      "verifyAccessToken",
      { originalError: errorMessage },
    );
  }
}
