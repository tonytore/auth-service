"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.optAuthMiddleware = optAuthMiddleware;
const custom_error_handler_1 = require("@/utils/error/custom_error_handler");
const logger_1 = require("@/utils/logger/logger");
const auth_1 = require("@/utils/helper/auth");
const db_1 = require("@/config/db");
const catch_async_1 = __importDefault(require("@/utils/helper/catch_async"));
exports.authMiddleware = (0, catch_async_1.default)(async (req, _res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        throw new custom_error_handler_1.UnauthenticatedError("Authentication required", "AuthMiddleware");
    }
    const payload = (0, auth_1.verifyAccessToken)(accessToken);
    // 🔒 Re-check user existence
    const user = await db_1.db.user.findUnique({
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
        throw new custom_error_handler_1.UnauthenticatedError("User no longer exists", "AuthMiddleware");
    }
    req.user = {
        ...user,
        name: user.name ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
    };
    next();
});
async function optAuthMiddleware(req, _res, next) {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return next();
    }
    const token = accessToken;
    try {
        const payload = (0, auth_1.verifyAccessToken)(token);
        req.user = {
            id: payload.userId,
            role: payload.role,
        };
        return next();
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        logger_1.logger.info("optAuth: token verify failed — continuing unauthenticated", {
            message: errorMessage,
        });
        return next();
    }
}
