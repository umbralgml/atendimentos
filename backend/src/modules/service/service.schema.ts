import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional(),
  duration: z.number().int().min(5, 'Duração mínima de 5 minutos'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
});

export const updateServiceSchema = createServiceSchema.partial();
