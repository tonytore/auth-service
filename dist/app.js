"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = require("./modules/auth/auth.route");
const logger_1 = require("./utils/logger/logger");
const app_config_1 = __importDefault(require("./config/app_config"));
const not_found_error_1 = __importDefault(
  require("./utils/error/not_found_error"),
);
const error_handler_1 = __importDefault(require("./utils/error/error_handler"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (_req, res) => {
  res.send("Auth Service is running");
});
app.use("/auth", auth_route_1.authRoute);
app.use(not_found_error_1.default);
app.use(error_handler_1.default);
app.listen(app_config_1.default.PORT, () => {
  logger_1.logger.info(
    `Auth Service running on port http://localhost:${app_config_1.default.PORT}`,
  );
});
