import { z } from "zod";

export const categoriaSchema = z.object({
  nome_categoria: z
    .string({ error: "Nome da categoria é obrigatório" })
    .trim()
    .min(1, "Nome da categoria é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});
