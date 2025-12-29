import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "./custom_error_handler";

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      `Route ${req.originalUrl} not found`,
      "notFoundHandler() Middleware",
    ),
  );
};

export default notFoundHandler;
