import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helper/response_helper';
import appConfig from '@/config/app_config';

export function requireInternalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const internalToken = req.header('X-Internal-Token');

  if (!internalToken) {
    return errorResponse(
      res,
      'Forbidden: internal access only',
      'InternalAuth',
      403,
    );
  }

  if (internalToken !== appConfig.INTERNAL_SERVICE_TOKEN) {
    return errorResponse(
      res,
      'Forbidden: invalid internal token',
      'InternalAuth',
      403,
    );
  }

  next();
}
