import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

export async function list(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const professionals = await prisma.professional.findMany({
    where: { tenantId, active: true },
    include: { services: { include: { service: true } }, availability: true },
    orderBy: { name: 'asc' },
  });
  return ApiResponse.success(res, professionals);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const professional = await prisma.professional.findFirst({
    where: { id, tenantId: req.tenantId! },
    include: { services: { include: { service: true } }, availability: true, appointments: { take: 10, orderBy: { date: 'desc' }, include: { client: true, service: true } } },
  });
  if (!professional) return ApiResponse.notFound(res, 'Profissional não encontrado');
  return ApiResponse.success(res, professional);
}

export async function create(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const { name, phone, email, avatar, serviceIds } = req.body;

  const professional = await prisma.professional.create({
    data: {
      tenantId,
      name,
      phone,
      email,
      avatar,
      services: serviceIds?.length
        ? { create: serviceIds.map((serviceId: string) => ({ serviceId })) }
        : undefined,
    },
    include: { services: { include: { service: true } } },
  });

  return ApiResponse.created(res, professional);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, phone, email, avatar, serviceIds } = req.body;

  const existing = await prisma.professional.findFirst({ where: { id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Profissional não encontrado');

  if (serviceIds) {
    await prisma.professionalService.deleteMany({ where: { professionalId: id } });
  }

  const professional = await prisma.professional.update({
    where: { id },
    data: {
      name, phone, email, avatar,
      services: serviceIds?.length
        ? { create: serviceIds.map((serviceId: string) => ({ serviceId })) }
        : undefined,
    },
    include: { services: { include: { service: true } } },
  });

  return ApiResponse.success(res, professional, 'Profissional atualizado');
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.professional.findFirst({ where: { id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Profissional não encontrado');

  await prisma.professional.update({ where: { id }, data: { active: false } });
  return ApiResponse.success(res, null, 'Profissional removido');
}
