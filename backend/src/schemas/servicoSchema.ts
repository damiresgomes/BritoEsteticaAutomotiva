import { z } from "zod";

export const cadastroServicoSchema = z.object({
  nome_servico: z
  .string({error: "Nome do serviço é obrigatório"})
  .trim()
  .min(1, "Nome do serviço é obrigatório")
  .max(100, "Nome do serviço deve ter no máximo 100 caracteres"),
  descricao: z
  .string({error: "Descrição do serviço é obrigatória"})
  .trim()
  .min(1, "Descrição do serviço é obrigatória"),
  preco: z
  .number({error: "Preço é obrigatório"})
  .positive("Preço deve ser maior que zero")
  .max(99999999.99, "Preço deve ser no máximo 99999999.99"),
  duracao_horas: z
  .number({error: "Duração é obrigatória"})
  .positive("Duração deve ser maior que zero")
  .max(99.99, "Duração deve ser no máximo 99.99 horas"),
  id_categoria: z
  .number({error: "Categoria é obrigatória"})
  .positive("Categoria deve ser maior que zero"),
});

export type CadastroServicoInput = z.infer<typeof cadastroServicoSchema>;
