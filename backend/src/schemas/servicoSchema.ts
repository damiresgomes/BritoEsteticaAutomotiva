import { z } from "zod";

// Exporta a constante 'cadastroServicoSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroServicoSchema = z.object({
  // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
  nome_servico: z
  // Executa: .string({error: "Nome do serviço é obrigatório"}).
  .string({error: "Nome do serviço é obrigatório"})
  // Executa: .trim().
  .trim()
  // Executa: .min(1, "Nome do serviço é obrigatório").
  .min(1, "Nome do serviço é obrigatório")
  // Executa: .max(100, "Nome do serviço deve ter no máximo 100 caracteres"),.
  .max(100, "Nome do serviço deve ter no máximo 100 caracteres"),
  // Define a propriedade/campo 'descricao' no objeto/estrutura.
  descricao: z
  // Executa: .string({error: "Descrição do serviço é obrigatória"}).
  .string({error: "Descrição do serviço é obrigatória"})
  // Executa: .trim().
  .trim()
  // Executa: .min(1, "Descrição do serviço é obrigatória"),.
  .min(1, "Descrição do serviço é obrigatória"),
  // Define a propriedade/campo 'preco' no objeto/estrutura.
  preco: z
  // Executa: .number({error: "Preço é obrigatório"}).
  .number({error: "Preço é obrigatório"})
  // Executa: .positive("Preço deve ser maior que zero").
  .positive("Preço deve ser maior que zero")
  // Executa: .max(99999999.99, "Preço deve ser no máximo 99999999.99"),.
  .max(99999999.99, "Preço deve ser no máximo 99999999.99"),
  // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
  duracao_horas: z
  // Executa: .number({error: "Duração é obrigatória"}).
  .number({error: "Duração é obrigatória"})
  // Executa: .positive("Duração deve ser maior que zero").
  .positive("Duração deve ser maior que zero")
  // Executa: .max(99.99, "Duração deve ser no máximo 99.99 horas"),.
  .max(99.99, "Duração deve ser no máximo 99.99 horas"),
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: z
  // Executa: .number({error: "Categoria é obrigatória"}).
  .number({error: "Categoria é obrigatória"})
  // Executa: .positive("Categoria deve ser maior que zero"),.
  .positive("Categoria deve ser maior que zero"),
});

// Exporta a constante 'listarServicosQuerySchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const listarServicosQuerySchema = z.object({
  // Define a propriedade/campo 'categoria' no objeto/estrutura.
  categoria: z.coerce.number().int().positive().optional(),
});

// Declara o alias de tipo 'CadastroServicoInput' para nomear uma estrutura de tipo reutilizável.
export type CadastroServicoInput = z.infer<typeof cadastroServicoSchema>;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schemas Zod para serviço.
