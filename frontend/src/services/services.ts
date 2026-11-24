import api from "./api";
import type { RespostaListagem } from "./listagem";

// Define e exporta a interface 'Servico' para tipagem.
export interface Servico {
  id_servico: number;
  nome_servico: string;
  descricao: string;
  preco: number;
  duracao_horas: number;
  id_categoria: number;
}

// Exporta a constante 'servicoService'.
export const servicoService = {
  async listarTodos(): Promise<Servico[]> {
    // Declara constante 'response'.
    const response = await api.get<Servico[]>("/servicos/listar");

    // Retorna response.data.
    return response.data;
  },

  async listarPaginado(
    pagina: number,
    limite: number
  ): Promise<RespostaListagem<Servico>> {
    // Declara constante 'response'.
    const response = await api.get<RespostaListagem<Servico>>("/servicos/listar", {
      params: { pagina, limite },
    });
    // Retorna response.data.
    return response.data;
  },

  async listarPorCategoria(categoria: number): Promise<Servico[]> {
    // Declara constante 'response'.
    const response = await api.get<Servico[]>("/servicos/listar", {
      params: { categoria },
    });

    // Retorna response.data.
    return response.data;
  },

  async criar(dados: Omit<Servico, "id_servico">): Promise<void> {
    // Aguarda operação assíncrona: api.post("/servicos/cadastro", dados);.
    await api.post("/servicos/cadastro", dados);
  },

  async atualizar(id: number, dados: Omit<Servico, "id_servico">): Promise<void> {
    // Aguarda operação assíncrona: api.put(`/servicos/atualizar/${id}`, dados);.
    await api.put(`/servicos/atualizar/${id}`, dados);
  },

  async excluir(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.delete(`/servicos/deletar/${id}`);.
    await api.delete(`/servicos/deletar/${id}`);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend para CRUD/listagem de serviços.
