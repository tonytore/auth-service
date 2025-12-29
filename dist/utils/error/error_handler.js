"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const client_1 = require("@prisma/client");
const logger_1 = require("../logger/logger");
const custom_error_handler_1 = require("./custom_error_handler");
const response_helper_1 = require("../helper/response_helper");
const errorHandler = (err, req, res, _next) => {
    if (res.headersSent) {
        logger_1.logger.error({ message: err.message, stack: err.stack, ip: req.ip });
        return;
    }
    if (err instanceof custom_error_handler_1.CustomError) {
        const errorDetails = err.serializeErrors();
        logger_1.logger.error({
            message: errorDetails.message,
            statusCode: errorDetails.statusCode,
            comingFrom: errorDetails.comingFrom,
            status: errorDetails.status,
            stack: err.stack,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            requestId: req.headers["x-request-id"] || "N/A",
        });
        (0, response_helper_1.errorResponse)(res, errorDetails.message, errorDetails, errorDetails.statusCode);
        return;
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        logger_1.logger.error(`${err}`);
        let errorMessage = "Database error occurred";
        let statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        const comingFrom = "Prisma";
        switch (err.code) {
            case "P2025":
                errorMessage = "Resource not found";
                statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
                break;
            case "P2002":
                errorMessage = "Conflict with existing resource";
                statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
                break;
            case "P2003":
                errorMessage = "Foreign key constraint violation";
                statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
                break;
            default:
                errorMessage = "Database error occurred";
                statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
        logger_1.logger.error({
            message: errorMessage,
            statusCode: statusCode,
            comingFrom: comingFrom,
            stack: err.stack,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            requestId: req.headers["x-request-id"] || "N/A",
        });
        (0, response_helper_1.errorResponse)(res, errorMessage, err.meta, statusCode);
        return;
    }
    else {
        logger_1.logger.error({
            message: err.message,
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            comingFrom: "Unknown",
            status: "error",
            stack: err.stack,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            requestId: req.headers["x-request-id"] || "N/A",
        });
        (0, response_helper_1.errorResponse)(res, "Something went wrong!", err, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        return;
    }
};
exports.default = errorHandler;
