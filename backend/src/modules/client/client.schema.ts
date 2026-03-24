import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();
