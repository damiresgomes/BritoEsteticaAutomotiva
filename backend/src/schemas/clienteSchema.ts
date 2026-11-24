import { z } from "zod";
import { loginSchema } from "./authSchema";
import { senhaSchema } from "./usuarioSchema";
import { cpfValido, normalizarCpf } from "../validators/cpf";

// Declara a função local 'formatarTelefone'(valor: string) para encapsular lógica reutilizável neste arquivo.
function formatarTelefone(valor: string): string {
  // Cria a constante local 'digitos'; usar const evita reatribuição acidental.
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 11
    ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
    : `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
}

// Cria a constante local 'telefoneSchema'; usar const evita reatribuição acidental.
const telefoneSchema = z
  // Executa: .string({ error: "Telefone é obrigatório" }).
  .string({ error: "Telefone é obrigatório" })
  // Executa: .refine((valor) => {.
  .refine((valor) => {
    // Cria a constante local 'tamanho'; usar const evita reatribuição acidental.
    const tamanho = valor.replace(/\D/g, "").length;
    // Retorna tamanho === 10 || tamanho === 11 para quem chamou esta função.
    return tamanho === 10 || tamanho === 11;
  }, "Telefone inválido")
  // Executa: .transform(formatarTelefone);.
  .transform(formatarTelefone);

// Cria a constante local 'cpfSchema'; usar const evita reatribuição acidental.
const cpfSchema = z
  // Executa: .string({ error: "CPF é obrigatório" }).
  .string({ error: "CPF é obrigatório" })
  // Executa: .refine(cpfValido, "CPF inválido").
  .refine(cpfValido, "CPF inválido")
  // Executa: .transform(normalizarCpf);.
  .transform(normalizarCpf);

// Cria a constante local 'dadosClienteSchema'; usar const evita reatribuição acidental.
const dadosClienteSchema = z.object({
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: loginSchema.shape.email,
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: cpfSchema,
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: telefoneSchema,
});

// Exporta a constante 'cadastroClienteAdminSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroClienteAdminSchema = dadosClienteSchema.extend({
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: senhaSchema,
}).strict();

// Exporta a constante 'atualizacaoClienteAdminSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizacaoClienteAdminSchema = dadosClienteSchema.extend({
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: senhaSchema.optional(),
}).strict();

// Exporta a constante 'idClienteSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const idClienteSchema = z.coerce.number().int().positive();

// Cria a constante local 'emailClienteSchema'; usar const evita reatribuição acidental.
const emailClienteSchema = z.string().trim().toLowerCase().email().max(100);
// Cria a constante local 'senhaForteClienteSchema'; usar const evita reatribuição acidental.
const senhaForteClienteSchema = z
  // Executa: .string().
  .string()
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

// Exporta a constante 'cadastroClienteSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroClienteSchema = z.object({
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: z.string().trim().min(2).max(100),
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: emailClienteSchema,
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: cpfSchema,
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: senhaForteClienteSchema,
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: z.string().trim().min(10).max(20),
});

// Exporta a constante 'atualizarClienteSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizarClienteSchema = cadastroClienteSchema
  // Executa: .omit({ email: true }).
  .omit({ email: true })
  // Executa: .extend({ senha: senhaForteClienteSchema.optional() }).
  .extend({ senha: senhaForteClienteSchema.optional() })
  // Executa: .strict();.
  .strict();

// Exporta a constante 'atualizarClienteUsuarioSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const atualizarClienteUsuarioSchema = cadastroClienteSchema
  // Executa: .omit({ senha: true }).
  .omit({ senha: true })
  // Executa: .strict();.
  .strict();

// Declara o alias de tipo 'CadastroClienteInput' para nomear uma estrutura de tipo reutilizável.
export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>;
// Declara o alias de tipo 'AtualizarClienteInput' para nomear uma estrutura de tipo reutilizável.
export type AtualizarClienteInput = z.infer<typeof atualizarClienteSchema>;
// Declara o alias de tipo 'AtualizarClienteUsuarioInput' para nomear uma estrutura de tipo reutilizável.
export type AtualizarClienteUsuarioInput = z.infer<typeof atualizarClienteUsuarioSchema>;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schemas Zod para dados de cliente.
