import { z } from 'zod';

export const registerSchema = z.object({
  tenantName: z.string().min(2, 'Nome da empresa é obrigatório'),
  tenantSlug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  segment: z.enum(['CLINIC', 'SALON', 'BARBERSHOP', 'MANICURE', 'GENERAL']).default('GENERAL'),
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  tenantSlug: z.string().min(1, 'Identificador da empresa é obrigatório'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
