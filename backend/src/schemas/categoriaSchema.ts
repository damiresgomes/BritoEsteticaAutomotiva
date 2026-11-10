import { z } from "zod";

export const cadastroCategoriaSchema = z.object({
  nome_categoria: z
    .string({ error: "Nome da categoria é obrigatório" })
    .trim()
    .min(1, "Nome da categoria é obrigatório")
    .max(100, "Nome da categoria deve ter no máximo 100 caracteres"),
});

export const categoriaSchema = cadastroCategoriaSchema;

export type CadastroCategoriaInput = z.infer<typeof cadastroCategoriaSchema>;
