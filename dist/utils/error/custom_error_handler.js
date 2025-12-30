"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTooLargeError =
  exports.InternalServerError =
  exports.ForbiddenError =
  exports.UnauthenticatedError =
  exports.NotFoundError =
  exports.BadRequestError =
  exports.CustomError =
    void 0;
const http_status_codes_1 = require("http-status-codes");
class CustomError extends Error {
  comingFrom;
  metadata;
  constructor(message, comingFrom, metadata) {
    super(message);
    this.comingFrom = comingFrom;
    this.metadata = metadata;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor); // For better stack trace
  }
  serializeErrors() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      comingFrom: this.comingFrom,
      stack: this.stack,
      metadata: this.metadata,
    };
  }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.NotFoundError = NotFoundError;
class UnauthenticatedError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.UnauthenticatedError = UnauthenticatedError;
class ForbiddenError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.FORBIDDEN;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.InternalServerError = InternalServerError;
class FileTooLargeError extends CustomError {
  statusCode = http_status_codes_1.StatusCodes.REQUEST_TOO_LONG;
  status = "error";
  constructor(message, comingFrom, metadata) {
    super(message, comingFrom, metadata);
  }
}
exports.FileTooLargeError = FileTooLargeError;
