import { z } from "zod";
import { senhaSchema } from "./usuarioSchema";

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

function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 11
    ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
    : `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
}

export const cadastroClienteSchema = z.object({
  nome: z
    .string({ error: "Nome é obrigatório" })
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: loginSchema.shape.email,
  senha: senhaSchema,
  telefone: z
    .string({ error: "Telefone é obrigatório" })
    .refine((valor) => {
      const tamanho = valor.replace(/\D/g, "").length;
      return tamanho === 10 || tamanho === 11;
    }, "Telefone inválido")
    .transform(formatarTelefone),
}).strict();

export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>;
