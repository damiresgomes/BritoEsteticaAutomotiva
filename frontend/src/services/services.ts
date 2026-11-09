import api from "./api";

export interface Servico {
  id_servico: number;
  nome_servico: string;
  descricao: string;
  preco: number;
  duracao_horas: number;
  id_categoria: number;
}

export const servicoService = {
  async listarTodos(): Promise<Servico[]> {
    const response = await api.get<Servico[]>("/servicos/listar");

    return response.data;
  },

  async listarPorCategoria(categoria: number): Promise<Servico[]> {
    const response = await api.get<Servico[]>("/servicos/listar", {
      params: { categoria },
    });

    return response.data;
  },

  async criar(dados: Omit<Servico, "id_servico">): Promise<void> {
    await api.post("/servicos/cadastro", dados);
  },

  async atualizar(id: number, dados: Omit<Servico, "id_servico">): Promise<void> {
    await api.put(`/servicos/atualizar/${id}`, dados);
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/servicos/deletar/${id}`);
  },
};
