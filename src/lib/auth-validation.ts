import { z } from "zod";

const password = z.string()
  .min(10, "Use at least 10 characters")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  mobile: z.string().transform((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  }).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number")),
  password,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password")
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")) });

export const resetPasswordSchema = z.object({ token: z.string().min(32), password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export type SafeUser = { id: number; name: string; email: string; mobile: string; role: "CUSTOMER" | "ADMIN" };
