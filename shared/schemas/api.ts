/**
 * Shared API schema types
 */
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(20),
});

export const uuidSchema = z.string().uuid();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createClientSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type CreateClientData = z.infer<typeof createClientSchema>;
