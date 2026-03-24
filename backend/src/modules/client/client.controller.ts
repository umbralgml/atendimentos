import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

export async function list(req: Request, res: Response) {
  const { search, page = '1', limit = '20' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { tenantId: req.tenantId! };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { phone: { contains: String(search) } },
      { email: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
    prisma.client.count({ where }),
  ]);

  return ApiResponse.paginated(res, clients, total, Number(page), Number(limit));
}

export async function getById(req: Request, res: Response) {
  const client = await prisma.client.findFirst({
    where: { id: req.params.id, tenantId: req.tenantId! },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 20,
        include: { professional: true, service: true },
      },
    },
  });
  if (!client) return ApiResponse.notFound(res, 'Cliente não encontrado');
  return ApiResponse.success(res, client);
}

export async function create(req: Request, res: Response) {
  const client = await prisma.client.create({
    data: { tenantId: req.tenantId!, ...req.body },
  });
  return ApiResponse.created(res, client);
}

export async function update(req: Request, res: Response) {
  const existing = await prisma.client.findFirst({ where: { id: req.params.id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Cliente não encontrado');

  const client = await prisma.client.update({ where: { id: req.params.id }, data: req.body });
  return ApiResponse.success(res, client, 'Cliente atualizado');
}

export async function remove(req: Request, res: Response) {
  const existing = await prisma.client.findFirst({ where: { id: req.params.id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Cliente não encontrado');

  await prisma.client.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, null, 'Cliente removido');
}
