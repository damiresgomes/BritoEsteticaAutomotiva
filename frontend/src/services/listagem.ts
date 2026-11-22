export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface RespostaListagem<T> {
  dados: T[];
  paginacao: Paginacao;
}
