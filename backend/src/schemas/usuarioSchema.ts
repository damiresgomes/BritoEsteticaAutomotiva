import { z } from "zod";
import { cpfValido } from "../validators/cpf";
import { dataDeCalendarioValida, dataNaoEstaNoFuturo, temIdadeMinima } from "../validators/data";

const emailSchema = z
  .string({ error: "E-mail é obrigatório" })
  .trim()
  .toLowerCase()
  .max(100, "E-mail deve ter no máximo 100 caracteres")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail é inválido");

export const senhaSchema = z
  .string({ error: "Senha é obrigatória" })
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter um símbolo");

const dataNascimentoSchema = z
  .string({ error: "Data de nascimento é obrigatória" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
  .refine(dataDeCalendarioValida, "Data de nascimento inválida")
  .refine(dataNaoEstaNoFuturo, "Data de nascimento não pode estar no futuro")
  .refine((valor) => temIdadeMinima(valor, 18), "É preciso ter no mínimo 18 anos");

export const cadastroUsuarioSchema = z.object({
  nome: z
    .string({ error: "Nome é obrigatório" })
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: emailSchema,
  senha: senhaSchema,
  cpf: z
    .string({ error: "CPF é obrigatório" })
    .max(30, "CPF deve ter no máximo 30 caracteres")
    .refine(cpfValido, "CPF inválido"),
  salario: z
    .number({ error: "Salário é obrigatório" })
    .nonnegative("Salário não pode ser negativo"),
  datanascimento: dataNascimentoSchema,
});

export const perfilAdminSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  cpf: z
    .string({ error: "CPF é obrigatório" })
    .refine(cpfValido, "CPF inválido"),
  salario: z.number().finite().nonnegative("Salário não pode ser negativo"),
  datanascimento: dataNascimentoSchema,
  senha: senhaSchema.optional(),
}).strict();

export type CadastroUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;

export type AtualizacaoUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;
