import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

export async function getByProfessional(req: Request, res: Response) {
  const { professionalId } = req.params;
  const availability = await prisma.availability.findMany({
    where: { professionalId },
    orderBy: { dayOfWeek: 'asc' },
  });
  return ApiResponse.success(res, availability);
}

export async function setAvailability(req: Request, res: Response) {
  const { professionalId, schedules } = req.body;

  const professional = await prisma.professional.findFirst({
    where: { id: professionalId, tenantId: req.tenantId! },
  });
  if (!professional) return ApiResponse.notFound(res, 'Profissional não encontrado');

  // Upsert cada dia
  const results = await Promise.all(
    schedules.map((s: any) =>
      prisma.availability.upsert({
        where: { professionalId_dayOfWeek: { professionalId, dayOfWeek: s.dayOfWeek } },
        update: { startTime: s.startTime, endTime: s.endTime, active: s.active },
        create: { professionalId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, active: s.active },
      })
    )
  );

  return ApiResponse.success(res, results, 'Disponibilidade atualizada');
}
