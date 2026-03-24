import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantId) {
    return ApiResponse.error(res, 'Tenant não identificado', 400);
  }
  next();
}
