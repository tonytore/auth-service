import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { logger } from "../logger/logger";
import { CustomError } from "./custom_error_handler";
import { errorResponse } from "../helper/response_helper";
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (res.headersSent) {
    logger.error({ message: err.message, stack: err.stack, ip: req.ip });
    return;
  }
  if (err.message === 'request aborted') {
    logger.warn({
      message: 'Client aborted request',
      comingFrom: 'Client',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return;
  }

  if (err instanceof CustomError) {
    const errorDetails = err.serializeErrors();

    logger.error({
      message: errorDetails.message,
      statusCode: errorDetails.statusCode,
      comingFrom: errorDetails.comingFrom,
      status: errorDetails.status,
      stack: err.stack,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.headers["x-request-id"] || "N/A",
    });

    errorResponse(
      res,
      errorDetails.message,
      errorDetails,
      errorDetails.statusCode,
    );
    return;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`${err}`);
    let errorMessage = "Database error occurred";
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const comingFrom = "Prisma";

    switch (err.code) {
      case "P2025":
        errorMessage = "Resource not found";
        statusCode = StatusCodes.NOT_FOUND;
        break;
      case "P2002":
        errorMessage = "Conflict with existing resource";
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      case "P2003":
        errorMessage = "Foreign key constraint violation";
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      default:
        errorMessage = "Database error occurred";
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        break;
    }

    logger.error({
      message: errorMessage,
      statusCode: statusCode,
      comingFrom: comingFrom,
      stack: err.stack,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.headers["x-request-id"] || "N/A",
    });

    errorResponse(res, errorMessage, err.meta, statusCode);
    return;
  } else {
    logger.error({
      message: err.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      comingFrom: "Unknown",
      status: "error",
      stack: err.stack,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.headers["x-request-id"] || "N/A",
    });

    errorResponse(
      res,
      "Something went wrong!",
      err,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    return;
  }
};

export default errorHandler;
