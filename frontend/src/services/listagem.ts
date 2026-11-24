// Define e exporta a interface 'Paginacao' para tipagem.
export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

// Define e exporta a interface 'RespostaListagem' para tipagem.
export interface RespostaListagem<T> {
  dados: T[];
  paginacao: Paginacao;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Tipos/utilitários de resposta paginada usados pelos services.
