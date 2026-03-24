import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

export async function list(req: Request, res: Response) {
  const services = await prisma.service.findMany({
    where: { tenantId: req.tenantId!, active: true },
    orderBy: { name: 'asc' },
  });
  return ApiResponse.success(res, services);
}

export async function getById(req: Request, res: Response) {
  const service = await prisma.service.findFirst({
    where: { id: req.params.id, tenantId: req.tenantId! },
    include: { professionals: { include: { professional: true } } },
  });
  if (!service) return ApiResponse.notFound(res, 'Serviço não encontrado');
  return ApiResponse.success(res, service);
}

export async function create(req: Request, res: Response) {
  const service = await prisma.service.create({
    data: { tenantId: req.tenantId!, ...req.body },
  });
  return ApiResponse.created(res, service);
}

export async function update(req: Request, res: Response) {
  const existing = await prisma.service.findFirst({ where: { id: req.params.id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Serviço não encontrado');

  const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
  return ApiResponse.success(res, service, 'Serviço atualizado');
}

export async function remove(req: Request, res: Response) {
  const existing = await prisma.service.findFirst({ where: { id: req.params.id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Serviço não encontrado');

  await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
  return ApiResponse.success(res, null, 'Serviço removido');
}
