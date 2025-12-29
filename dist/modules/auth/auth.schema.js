"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    body: joi_1.default.object({
        email: joi_1.default
            .string()
            .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
            .required(),
        password: joi_1.default
            .string()
            .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
            .required(),
        name: joi_1.default.string().min(2).max(50).optional(),
        avatarUrl: joi_1.default.string().optional(),
        role: joi_1.default.string().optional(),
    }),
});
exports.loginSchema = joi_1.default.object({
    body: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
});
