import { z } from "zod";

// Exporta a constante 'cadastroCategoriaSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const cadastroCategoriaSchema = z.object({
  // Define a propriedade/campo 'nome_categoria' no objeto/estrutura.
  nome_categoria: z
    // Executa: .string({ error: "Nome da categoria é obrigatório" }).
    .string({ error: "Nome da categoria é obrigatório" })
    // Executa: .trim().
    .trim()
    // Executa: .min(1, "Nome da categoria é obrigatório").
    .min(1, "Nome da categoria é obrigatório")
    // Executa: .max(100, "Nome da categoria deve ter no máximo 100 caracteres"),.
    .max(100, "Nome da categoria deve ter no máximo 100 caracteres"),
});

// Exporta a constante 'categoriaSchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const categoriaSchema = cadastroCategoriaSchema;

// Declara o alias de tipo 'CadastroCategoriaInput' para nomear uma estrutura de tipo reutilizável.
export type CadastroCategoriaInput = z.infer<typeof cadastroCategoriaSchema>;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schemas Zod para categoria.
