import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { ApiResponse } from '../../utils/apiResponse';

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const newM = (totalMinutes % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
}

export async function listByDate(req: Request, res: Response) {
  const { date, professionalId } = req.query;
  if (!date) return ApiResponse.error(res, 'Data é obrigatória');

  const where: any = {
    tenantId: req.tenantId!,
    date: new Date(String(date)),
    status: { not: 'CANCELLED' },
  };
  if (professionalId) where.professionalId = String(professionalId);

  const appointments = await prisma.appointment.findMany({
    where,
    include: { professional: true, service: true, client: true },
    orderBy: { startTime: 'asc' },
  });

  return ApiResponse.success(res, appointments);
}

export async function listByWeek(req: Request, res: Response) {
  const { startDate, endDate, professionalId } = req.query;
  if (!startDate || !endDate) return ApiResponse.error(res, 'Datas de início e fim são obrigatórias');

  const where: any = {
    tenantId: req.tenantId!,
    date: { gte: new Date(String(startDate)), lte: new Date(String(endDate)) },
    status: { not: 'CANCELLED' },
  };
  if (professionalId) where.professionalId = String(professionalId);

  const appointments = await prisma.appointment.findMany({
    where,
    include: { professional: true, service: true, client: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return ApiResponse.success(res, appointments);
}

export async function create(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const { professionalId, serviceId, clientId, date, startTime, notes } = req.body;

  const service = await prisma.service.findFirst({ where: { id: serviceId, tenantId } });
  if (!service) return ApiResponse.notFound(res, 'Serviço não encontrado');

  const endTime = addMinutesToTime(startTime, service.duration);

  // Verificar conflito de horário
  const conflict = await prisma.appointment.findFirst({
    where: {
      professionalId,
      date: new Date(date),
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      OR: [
        { startTime: { gte: startTime, lt: endTime } },
        { endTime: { gt: startTime, lte: endTime } },
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }] },
      ],
    },
  });

  if (conflict) {
    return ApiResponse.error(res, 'Horário indisponível - conflito com outro agendamento', 409);
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId,
      professionalId,
      serviceId,
      clientId,
      date: new Date(date),
      startTime,
      endTime,
      price: service.price,
      notes,
    },
    include: { professional: true, service: true, client: true },
  });

  return ApiResponse.created(res, appointment, 'Agendamento criado com sucesso');
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.appointment.findFirst({
    where: { id, tenantId: req.tenantId! },
    include: { service: true },
  });
  if (!existing) return ApiResponse.notFound(res, 'Agendamento não encontrado');

  const data: any = {};
  if (req.body.status) data.status = req.body.status;
  if (req.body.notes !== undefined) data.notes = req.body.notes;

  if (req.body.startTime) {
    data.startTime = req.body.startTime;
    data.endTime = addMinutesToTime(req.body.startTime, existing.service.duration);
  }
  if (req.body.date) {
    data.date = new Date(req.body.date);
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: { professional: true, service: true, client: true },
  });

  return ApiResponse.success(res, appointment, 'Agendamento atualizado');
}

export async function cancel(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.appointment.findFirst({ where: { id, tenantId: req.tenantId! } });
  if (!existing) return ApiResponse.notFound(res, 'Agendamento não encontrado');

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return ApiResponse.success(res, appointment, 'Agendamento cancelado');
}

export async function getAvailableSlots(req: Request, res: Response) {
  const { professionalId, date, serviceId } = req.query;
  if (!professionalId || !date || !serviceId) {
    return ApiResponse.error(res, 'professionalId, date e serviceId são obrigatórios');
  }

  const service = await prisma.service.findFirst({ where: { id: String(serviceId), tenantId: req.tenantId! } });
  if (!service) return ApiResponse.notFound(res, 'Serviço não encontrado');

  const dayOfWeek = new Date(String(date)).getDay();
  const availability = await prisma.availability.findUnique({
    where: { professionalId_dayOfWeek: { professionalId: String(professionalId), dayOfWeek } },
  });

  if (!availability || !availability.active) {
    return ApiResponse.success(res, []);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: String(professionalId),
      date: new Date(String(date)),
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
    orderBy: { startTime: 'asc' },
  });

  // Gerar slots disponíveis
  const slots: string[] = [];
  let currentTime = availability.startTime;
  const endLimit = availability.endTime;

  while (currentTime < endLimit) {
    const slotEnd = addMinutesToTime(currentTime, service.duration);
    if (slotEnd > endLimit) break;

    const hasConflict = appointments.some((apt) => {
      return !(slotEnd <= apt.startTime || currentTime >= apt.endTime);
    });

    if (!hasConflict) {
      slots.push(currentTime);
    }

    currentTime = addMinutesToTime(currentTime, 30); // intervalo de 30min
  }

  return ApiResponse.success(res, slots);
}
