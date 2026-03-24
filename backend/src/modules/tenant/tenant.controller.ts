import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

export async function getTenant(req: Request, res: Response) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.tenantId! },
    select: { id: true, name: true, slug: true, phone: true, email: true, address: true, segment: true, plan: true },
  });
  if (!tenant) return ApiResponse.notFound(res, 'Empresa não encontrada');
  return ApiResponse.success(res, tenant);
}

export async function updateTenant(req: Request, res: Response) {
  const { name, phone, email, address } = req.body;
  const tenant = await prisma.tenant.update({
    where: { id: req.tenantId! },
    data: { name, phone, email, address },
    select: { id: true, name: true, slug: true, phone: true, email: true, address: true, segment: true, plan: true },
  });
  return ApiResponse.success(res, tenant, 'Empresa atualizada');
}

export async function getDashboard(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalClients, totalProfessionals, todayAppointments, upcomingAppointments] = await Promise.all([
    prisma.client.count({ where: { tenantId } }),
    prisma.professional.count({ where: { tenantId, active: true } }),
    prisma.appointment.count({ where: { tenantId, date: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } }),
    prisma.appointment.findMany({
      where: { tenantId, date: { gte: today }, status: 'SCHEDULED' },
      include: { professional: true, service: true, client: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 10,
    }),
  ]);

  return ApiResponse.success(res, { totalClients, totalProfessionals, todayAppointments, upcomingAppointments });
}
