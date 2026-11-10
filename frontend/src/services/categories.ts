import api from "./api";

export interface Categoria {
  id_categoria: number;
  nome_categoria: string;
}

export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>("/categorias/listar");
    return response.data;
  },

  async criar(nome_categoria: string): Promise<void> {
    await api.post("/categorias/cadastro", { nome_categoria });
  },

  async atualizar(id: number, nome_categoria: string): Promise<void> {
    await api.put(`/categorias/atualizar/${id}`, { nome_categoria });
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/categorias/deletar/${id}`);
  },
};
