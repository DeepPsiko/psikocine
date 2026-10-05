import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Ingresa tu usuario (@)"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nickname debe tener al menos 2 caracteres"),
  username: z
    .string()
    .min(3, "El usuario (@) debe tener al menos 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  avatar: z.string().optional().nullable().or(z.literal("")),
  bio: z.string().max(300, "Máximo 300 caracteres").optional().nullable(),
});

export const movieSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  originalTitle: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1888, "Año inválido").max(2100, "Año inválido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  poster: z.string().min(1, "El póster es obligatorio"),
  backdrop: z.string().optional().nullable().or(z.literal("")),
  duration: z.coerce.number().int().min(1, "Duración en minutos requerida"),
  director: z.string().min(2, "El director es obligatorio"),
  cast: z.string().min(2, "El reparto es obligatorio"),
  country: z.string().optional().nullable(),
  trailerUrl: z.string().optional().nullable(),
  genres: z.array(z.string()).min(1, "Selecciona al menos un género"),
});

export const ratingSchema = z.object({
  value: z
    .number()
    .min(0.5, "Mínimo 0.5 estrellas")
    .max(5.0, "Máximo 5.0 estrellas")
    .refine((val) => [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(val), {
      message: "La calificación debe ser en incrementos de 0.5 (entre 0.5 y 5.0)",
    }),
});

export const reviewSchema = z.object({
  content: z
    .string()
    .min(5, "La opinión debe tener al menos 5 caracteres")
    .max(3000, "La opinión no puede superar los 3000 caracteres"),
  hasSpoiler: z.boolean().default(false),
});

export const replySchema = z.object({
  content: z
    .string()
    .min(2, "La respuesta debe tener al menos 2 caracteres")
    .max(1000, "La respuesta no puede superar los 1000 caracteres"),
});

export const saturdayEventSchema = z.object({
  title: z.string().min(3, "Título obligatorio"),
  date: z.string().min(1, "Fecha obligatoria"),
  votingDeadline: z.string().min(1, "Fecha límite de votación obligatoria"),
  notes: z.string().optional(),
});

export const candidateSchema = z.object({
  movieId: z.string().min(1, "Selecciona una película"),
});
