import { z } from "zod";

export const paginacaoQuerySchema = z.object({
  pagina: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : undefined)),
  limite: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : undefined)),
});

export type PaginacaoQuery = z.infer<typeof paginacaoQuerySchema>;

export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export function formatarRespostaListagem<T>(
  itens: T[],
  total: number,
  pagina?: number,
  limite?: number
): T[] | RespostaPaginada<T> {
  if (pagina !== undefined) {
    const lim = limite ?? 10;
    return {
      dados: itens,
      paginacao: {
        pagina,
        limite: lim,
        total,
        totalPaginas: Math.ceil(total / lim) || 1,
      },
    };
  }

  // Se o frontend não pediu paginação explicita, devolve o array puro (zero quebra de front)
  return itens;
}

