"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_error_handler_1 = require("./custom_error_handler");
const notFoundHandler = (req, res, next) => {
  next(
    new custom_error_handler_1.NotFoundError(
      `Route ${req.originalUrl} not found`,
      "notFoundHandler() Middleware",
    ),
  );
};
exports.default = notFoundHandler;
