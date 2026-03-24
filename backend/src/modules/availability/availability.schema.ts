import { z } from 'zod';

export const setAvailabilitySchema = z.object({
  professionalId: z.string().uuid(),
  schedules: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    active: z.boolean().default(true),
  })),
});
