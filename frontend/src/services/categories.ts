import api from "./api";
import type { RespostaListagem } from "./listagem";

// Define e exporta a interface 'Categoria' para tipagem.
export interface Categoria {
  id_categoria: number;
  nome_categoria: string;
}

// Exporta a constante 'categoriaService'.
export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    // Declara constante 'response'.
    const response = await api.get<Categoria[]>("/categorias/listar");
    // Retorna response.data.
    return response.data;
  },

  async listarPaginado(
    pagina: number,
    limite: number
  ): Promise<RespostaListagem<Categoria>> {
    // Declara constante 'response'.
    const response = await api.get<RespostaListagem<Categoria>>("/categorias/listar", {
      params: { pagina, limite },
    });
    // Retorna response.data.
    return response.data;
  },

  async criar(nome_categoria: string): Promise<void> {
    // Aguarda operação assíncrona: api.post("/categorias/cadastro", { nome_categoria });.
    await api.post("/categorias/cadastro", { nome_categoria });
  },

  async atualizar(id: number, nome_categoria: string): Promise<void> {
    // Aguarda operação assíncrona: api.put(`/categorias/atualizar/${id}`, { nome_categoria });.
    await api.put(`/categorias/atualizar/${id}`, { nome_categoria });
  },

  async excluir(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.delete(`/categorias/deletar/${id}`);.
    await api.delete(`/categorias/deletar/${id}`);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend para CRUD de categorias.
