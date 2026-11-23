import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Имя слишком короткое")
    .max(40, "Имя слишком длинное"),
  email: z.email("Некорректный email").max(120),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .max(64, "Пароль слишком длинный"),
});

export const loginSchema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const reviewSchema = z.object({
  distro: z.string().regex(/^[a-z0-9-]+$/, "Неизвестный дистрибутив"),
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .trim()
    .min(15, "Расскажите чуть подробнее: минимум 15 символов")
    .max(1500, "Слишком длинный отзыв"),
});

export const favoriteSchema = z.object({
  distro: z.string().regex(/^[a-z0-9-]+$/),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
