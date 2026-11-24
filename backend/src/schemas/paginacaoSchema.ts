import { z } from "zod";

// Exporta a constante 'paginacaoQuerySchema'; seu valor é calculado na inicialização do módulo e pode ser importado por outros arquivos.
export const paginacaoQuerySchema = z.object({
  // Define a propriedade/campo 'pagina' no objeto/estrutura.
  pagina: z
    // Executa: .string().
    .string()
    // Executa: .optional().
    .optional()
    // Executa: .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : undefined)),.
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : undefined)),
  // Define a propriedade/campo 'limite' no objeto/estrutura.
  limite: z
    // Executa: .string().
    .string()
    // Executa: .optional().
    .optional()
    // Executa: .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : undefined)),.
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : undefined)),
});

// Declara o alias de tipo 'PaginacaoQuery' para nomear uma estrutura de tipo reutilizável.
export type PaginacaoQuery = z.infer<typeof paginacaoQuerySchema>;

// Declara a interface 'RespostaPaginada' para definir o contrato/forma de dados em TypeScript.
export interface RespostaPaginada<T> {
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: T[];
  paginacao: {
    // Define a propriedade/campo 'pagina' no objeto/estrutura.
    pagina: number;
    // Define a propriedade/campo 'limite' no objeto/estrutura.
    limite: number;
    // Define a propriedade/campo 'total' no objeto/estrutura.
    total: number;
    // Define a propriedade/campo 'totalPaginas' no objeto/estrutura.
    totalPaginas: number;
  };
}

export function formatarRespostaListagem<T>(
  // Define a propriedade/campo 'itens' no objeto/estrutura.
  itens: T[],
  // Define a propriedade/campo 'total' no objeto/estrutura.
  total: number,
  pagina?: number,
  limite?: number
): T[] | RespostaPaginada<T> {
  // Condição: se 'pagina !== undefined' for verdadeira, o bloco abaixo é executado.
  if (pagina !== undefined) {
    // Cria a constante local 'lim'; usar const evita reatribuição acidental.
    const lim = limite ?? 10;
    return {
      // Define a propriedade/campo 'dados' no objeto/estrutura.
      dados: itens,
      paginacao: {
        pagina,
        // Define a propriedade/campo 'limite' no objeto/estrutura.
        limite: lim,
        total,
        // Define a propriedade/campo 'totalPaginas' no objeto/estrutura.
        totalPaginas: Math.ceil(total / lim) || 1,
      },
    };
  }
  // Retorna itens para quem chamou esta função.
  return itens;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Schema/utilitário de paginação para validar pagina e limite.
