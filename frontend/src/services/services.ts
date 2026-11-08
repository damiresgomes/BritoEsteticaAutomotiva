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
  async listarPorCategoria(categoria: number): Promise<Servico[]> {
    const response = await api.get<Servico[]>("/servicos/listar", {
      params: { categoria },
    });

    return response.data;
  },
};
