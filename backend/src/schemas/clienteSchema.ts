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
    .transform(normalizarCpf),
  telefone: telefoneSchema,
});

export const cadastroClienteAdminSchema = dadosClienteSchema.extend({
  senha: senhaSchema,
}).strict();

export const atualizacaoClienteAdminSchema = dadosClienteSchema.extend({
  senha: senhaSchema.optional(),
}).strict();

export const idClienteSchema = z.coerce.number().int().positive();
