import api from "./api";

export type StatusCliente = "Ativo" | "Inativo" | "Sem conta";

export interface ClienteAdmin {
  id: number;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  status: StatusCliente;
  contaId: number | null;
}

export interface DadosCliente {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha?: string;
}

export const clienteService = {
  async listar(): Promise<ClienteAdmin[]> {
    const response = await api.get<ClienteAdmin[]>("/clientes/listar");
    return response.data;
  },

  async buscarPorId(id: number): Promise<ClienteAdmin> {
    const response = await api.get<ClienteAdmin>(`/clientes/${id}`);
    return response.data;
  },

  async criar(dados: DadosCliente): Promise<void> {
    await api.post("/clientes/cadastro", dados);
  },

  async atualizar(id: number, dados: DadosCliente): Promise<void> {
    await api.put(`/clientes/${id}`, dados);
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  async ativar(id: number): Promise<void> {
    await api.patch(`/clientes/${id}/ativar`);
  },
};
