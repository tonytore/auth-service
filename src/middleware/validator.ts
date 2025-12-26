import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectSchema } from 'joi';
import { errorResponse } from '../utils/helper/response_helper';

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    const { error } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      },
      { abortEarly: false, allowUnknown: true },
    );

    if (error) {
      error.details.forEach((err) => {
        // Normalize field path: strip the first segment (body/params/query/headers)
        const field =
          err.path.length > 1
            ? String(err.path.slice(1).join('.'))
            : String(err.path[0] || 'unknown');

        if (!errors[field]) errors[field] = [];
        errors[field].push(err.message.replace(/"/g, ''));
      });

      errorResponse(
        res,
        'error.validationFailed',
        errors,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    next();
  };
};
