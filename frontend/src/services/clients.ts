import api from "./api";
import type { RespostaListagem } from "./listagem";

// Define e exporta o tipo 'StatusCliente'.
export type StatusCliente = "Ativo" | "Inativo" | "Sem conta";

// Define e exporta a interface 'ClienteAdmin' para tipagem.
export interface ClienteAdmin {
  id: number;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  status: StatusCliente;
  contaId: number | null;
}

// Define e exporta a interface 'DadosCliente' para tipagem.
export interface DadosCliente {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha?: string;
}

// Exporta a constante 'clienteService'.
export const clienteService = {
  async listar(): Promise<ClienteAdmin[]> {
    // Declara constante 'response'.
    const response = await api.get<ClienteAdmin[]>("/clientes/listar");
    // Retorna response.data.
    return response.data;
  },

  async listarPaginado(
    pagina: number,
    limite: number
  ): Promise<RespostaListagem<ClienteAdmin>> {
    // Declara constante 'response'.
    const response = await api.get<RespostaListagem<ClienteAdmin>>("/clientes/listar", {
      params: { pagina, limite },
    });
    // Retorna response.data.
    return response.data;
  },

  async buscarPorId(id: number): Promise<ClienteAdmin> {
    // Declara constante 'response'.
    const response = await api.get<ClienteAdmin>(`/clientes/${id}`);
    // Retorna response.data.
    return response.data;
  },

  async criar(dados: DadosCliente): Promise<void> {
    // Aguarda operação assíncrona: api.post("/clientes/cadastro", dados);.
    await api.post("/clientes/cadastro", dados);
  },

  async atualizar(id: number, dados: DadosCliente): Promise<void> {
    // Aguarda operação assíncrona: api.put(`/clientes/${id}`, dados);.
    await api.put(`/clientes/${id}`, dados);
  },

  async excluir(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.delete(`/clientes/${id}`);.
    await api.delete(`/clientes/${id}`);
  },

  async ativar(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.patch(`/clientes/${id}/ativar`);.
    await api.patch(`/clientes/${id}/ativar`);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend para CRUD de clientes.
