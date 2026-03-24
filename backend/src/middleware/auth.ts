import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiResponse } from '../utils/apiResponse';

export interface AuthPayload {
  userId: string;
  tenantId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      tenantId?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Token não fornecido');
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = payload;
    req.tenantId = payload.tenantId;
    next();
  } catch {
    return ApiResponse.unauthorized(res, 'Token inválido ou expirado');
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res);
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Sem permissão para esta ação');
    }
    next();
  };
}
