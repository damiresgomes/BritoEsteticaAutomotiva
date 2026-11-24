import { z } from "zod";
import { cpfValido } from "../validators/cpf";
import { dataDeCalendarioValida, dataNaoEstaNoFuturo, temIdadeMinima } from "../validators/data";

// Cria a constante local 'emailSchema'; usar const evita reatribuição acidental.
const emailSchema = z
  // Executa: .string({ error: "E-mail é obrigatório" }).
  .string({ error: "E-mail é obrigatório" })
  // Executa: .trim().
  .trim()
  // Executa: .toLowerCase().
  .toLowerCase()
  // Executa: .max(100, "E-mail deve ter no máximo 100 caracteres").
  .max(100, "E-mail deve ter no máximo 100 caracteres")
  // Executa: .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail é inválido");.
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail é inválido");

// Exporta a constante 'senhaSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const senhaSchema = z
  // Executa: .string({ error: "Senha é obrigatória" }).
  .string({ error: "Senha é obrigatória" })
  // Executa: .min(8, "A senha deve ter no mínimo 8 caracteres").
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  // Executa: .max(72, "A senha deve ter no máximo 72 caracteres").
  .max(72, "A senha deve ter no máximo 72 caracteres")
  // Executa: .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula").
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
  // Executa: .regex(/[a-z]/, "A senha deve conter uma letra minúscula").
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
  // Executa: .regex(/[0-9]/, "A senha deve conter um número").
  .regex(/[0-9]/, "A senha deve conter um número")
  // Executa: .regex(/[^A-Za-z0-9]/, "A senha deve conter um símbolo");.
  .regex(/[^A-Za-z0-9]/, "A senha deve conter um símbolo");

// Cria a constante local 'dataNascimentoSchema'; usar const evita reatribuição acidental.
const dataNascimentoSchema = z
  // Executa: .string({ error: "Data de nascimento é obrigatória" }).
  .string({ error: "Data de nascimento é obrigatória" })
  // Executa: .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD").
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
  // Executa: .refine(dataDeCalendarioValida, "Data de nascimento inválida").
  .refine(dataDeCalendarioValida, "Data de nascimento inválida")
  // Executa: .refine(dataNaoEstaNoFuturo, "Data de nascimento não pode estar no futuro").
  .refine(dataNaoEstaNoFuturo, "Data de nascimento não pode estar no futuro")
  // Executa: .refine((valor) => temIdadeMinima(valor, 18), "É preciso ter no mínimo 18 anos");.
  .refine((valor) => temIdadeMinima(valor, 18), "É preciso ter no mínimo 18 anos");

// Exporta a constante 'cadastroUsuarioSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroUsuarioSchema = z.object({
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: z
    // Executa: .string({ error: "Nome é obrigatório" }).
    .string({ error: "Nome é obrigatório" })
    // Executa: .trim().
    .trim()
    // Executa: .min(1, "Nome é obrigatório").
    .min(1, "Nome é obrigatório")
    // Executa: .max(100, "Nome deve ter no máximo 100 caracteres"),.
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: emailSchema,
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: senhaSchema,
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: z
    // Executa: .string({ error: "CPF é obrigatório" }).
    .string({ error: "CPF é obrigatório" })
    // Executa: .max(30, "CPF deve ter no máximo 30 caracteres").
    .max(30, "CPF deve ter no máximo 30 caracteres")
    // Executa: .refine(cpfValido, "CPF inválido"),.
    .refine(cpfValido, "CPF inválido"),
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: z
    // Executa: .number({ error: "Salário é obrigatório" }).
    .number({ error: "Salário é obrigatório" })
    // Executa: .nonnegative("Salário não pode ser negativo"),.
    .nonnegative("Salário não pode ser negativo"),
  // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
  datanascimento: dataNascimentoSchema,
});

// Exporta a constante 'perfilAdminSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const perfilAdminSchema = z.object({
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: z
    // Executa: .string({ error: "CPF é obrigatório" }).
    .string({ error: "CPF é obrigatório" })
    // Executa: .refine(cpfValido, "CPF inválido"),.
    .refine(cpfValido, "CPF inválido"),
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: z.number().finite().nonnegative("Salário não pode ser negativo"),
  // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
  datanascimento: dataNascimentoSchema,
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: senhaSchema.optional(),
}).strict();

// Exporta a constante 'atualizacaoUsuarioSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizacaoUsuarioSchema = cadastroUsuarioSchema
  // Executa: .omit({ email: true }).
  .omit({ email: true })
  // Executa: .strict();.
  .strict();

// Declara o alias de tipo 'CadastroUsuarioInput' para nomear uma estrutura de tipo reutilizável.
export type CadastroUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;

// Declara o alias de tipo 'AtualizacaoUsuarioInput' para nomear uma estrutura de tipo reutilizável.
export type AtualizacaoUsuarioInput = z.infer<typeof atualizacaoUsuarioSchema>;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schemas Zod para criação/edição de usuários.
