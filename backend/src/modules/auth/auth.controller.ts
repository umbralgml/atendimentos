import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import { config } from '../../config';
import { ApiResponse } from '../../utils/apiResponse';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthPayload } from '../../middleware/auth';

export async function register(req: Request, res: Response) {
  const { tenantName, tenantSlug, segment, name, email, password } = req.body as RegisterInput;

  const existing = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (existing) {
    return ApiResponse.error(res, 'Este identificador de empresa já está em uso', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      slug: tenantSlug,
      segment,
      users: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      },
    },
    include: { users: { select: { id: true, name: true, email: true, role: true } } },
  });

  const user = tenant.users[0];
  const tokenPayload: AuthPayload = {
    userId: user.id,
    tenantId: tenant.id,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  return ApiResponse.created(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, segment: tenant.segment },
  }, 'Empresa cadastrada com sucesso');
}

export async function login(req: Request, res: Response) {
  const { email, password, tenantSlug } = req.body as LoginInput;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !tenant.active) {
    return ApiResponse.unauthorized(res, 'Empresa não encontrada ou inativa');
  }

  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
  });
  if (!user || !user.active) {
    return ApiResponse.unauthorized(res, 'Credenciais inválidas');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return ApiResponse.unauthorized(res, 'Credenciais inválidas');
  }

  const tokenPayload: AuthPayload = {
    userId: user.id,
    tenantId: tenant.id,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  return ApiResponse.success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, segment: tenant.segment },
  }, 'Login realizado com sucesso');
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, tenant: { select: { id: true, name: true, slug: true, segment: true, plan: true } } },
  });

  if (!user) {
    return ApiResponse.notFound(res, 'Usuário não encontrado');
  }

  return ApiResponse.success(res, user);
}
