"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
exports.generateRefreshToken = generateRefreshToken;
const crypto_1 = __importDefault(require("crypto"));
function hashToken(token) {
  return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function generateRefreshToken() {
  return crypto_1.default.randomBytes(40).toString("hex");
}
