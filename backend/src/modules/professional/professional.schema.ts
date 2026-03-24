import { z } from 'zod';

export const createProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  avatar: z.string().optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export const updateProfessionalSchema = createProfessionalSchema.partial();

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
