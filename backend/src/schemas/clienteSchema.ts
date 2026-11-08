import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email().max(100);
const senhaSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter um símbolo");

export const cadastroClienteSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: emailSchema,
  senha: senhaSchema,
  telefone: z.string().trim().min(10).max(20),
});

export const atualizarClienteSchema = cadastroClienteSchema
  .omit({ email: true })
  .strict();

export const atualizarClienteUsuarioSchema = cadastroClienteSchema
  .omit({ senha: true })
  .strict();

export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>;
export type AtualizarClienteInput = z.infer<typeof atualizarClienteSchema>;
export type AtualizarClienteUsuarioInput = z.infer<typeof atualizarClienteUsuarioSchema>;