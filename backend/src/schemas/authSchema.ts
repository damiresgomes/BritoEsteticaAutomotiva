import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "E-mail é obrigatório" })
    .trim()
    .toLowerCase()
    .max(100, "E-mail deve ter no máximo 100 caracteres")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail é inválido"),
  senha: z.string({ error: "Senha é obrigatória" }).min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;
