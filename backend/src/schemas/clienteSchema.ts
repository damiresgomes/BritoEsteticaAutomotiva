import { z } from "zod";
import { loginSchema } from "./authSchema";
import { senhaSchema } from "./usuarioSchema";
import { cpfValido, normalizarCpf } from "../validators/cpf";

function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 11
    ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
    : `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
}

const telefoneSchema = z
  .string({ error: "Telefone é obrigatório" })
  .refine((valor) => {
    const tamanho = valor.replace(/\D/g, "").length;
    return tamanho === 10 || tamanho === 11;
  }, "Telefone inválido")
  .transform(formatarTelefone);

const dadosClienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: loginSchema.shape.email,
  cpf: z.string({ error: "CPF é obrigatório" })
    .refine(cpfValido, "CPF inválido")
    .transform(normalizarCpf)
    .optional(),
  telefone: telefoneSchema,
});

export const cadastroClienteAdminSchema = dadosClienteSchema.extend({
  senha: senhaSchema,
}).strict();

export const atualizacaoClienteAdminSchema = dadosClienteSchema.extend({
  senha: senhaSchema.optional(),
}).strict();

export const idClienteSchema = z.coerce.number().int().positive();

const emailClienteSchema = z.string().trim().toLowerCase().email().max(100);
const senhaForteClienteSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter um símbolo");

export const cadastroClienteSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: emailClienteSchema,
  senha: senhaForteClienteSchema,
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

