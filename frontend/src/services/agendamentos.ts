import api from "./api";
import type { RespostaListagem } from "./listagem";

// Define e exporta a interface 'CriarAgendamento' para tipagem.
export interface CriarAgendamento {
  placa: string;
  veiculo: string;
  servicoId: number;
  data: string;
  horario: string;
  observacoes?: string;
  extras: number[];
}

// Define e exporta a interface 'AgendamentoCriado' para tipagem.
export interface AgendamentoCriado {
  message: string;
  id: number;
  total: number;
}

// Define e exporta o tipo 'StatusAgendamento'.
export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado";

// Define e exporta o tipo 'StatusAgendamentoCompleto'.
export type StatusAgendamentoCompleto =
  | "Pendente"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

// Define e exporta o tipo 'StatusMeuAgendamento'.
export type StatusMeuAgendamento = StatusAgendamentoCompleto;

// Define e exporta a interface 'MeuAgendamento' para tipagem.
export interface MeuAgendamento {
  id_agendamento: number;
  data_hora: string;
  placa_veiculo: string;
  modelo_veiculo: string;
  status: StatusMeuAgendamento;
  servicos: {
    id_servico: number;
    nome_servico: string;
    preco: number;
    id_categoria: number;
  }[];
}

// Define e exporta a interface 'AtualizarMeuAgendamento' para tipagem.
export interface AtualizarMeuAgendamento {
  data_hora: string;
  placa_veiculo: string;
  modelo_veiculo: string;
  servicos: number[];
}

// Define e exporta a interface 'AgendamentoAdministrativo' para tipagem.
export interface AgendamentoAdministrativo {
  id: number;
  clienteId: number;
  cliente: string;
  servico: string;
  servicoId: number;
  extras: number[];
  placa: string;
  veiculo: string;
  observacoes: string | null;
  data: string;
  horario: string;
  status: StatusAgendamento;
}

// Define e exporta a interface 'AgendamentoDashboard' para tipagem.
export interface AgendamentoDashboard
  extends Omit<AgendamentoAdministrativo, "status"> {
  status: StatusAgendamentoCompleto;
}

// Define e exporta a interface 'CriarAgendamentoAdmin' para tipagem.
export interface CriarAgendamentoAdmin extends CriarAgendamento {
  clienteId: number;
}

// Exporta a constante 'agendamentoService'.
export const agendamentoService = {
  async listarMeus(): Promise<MeuAgendamento[]> {
    // Declara constante 'response'.
    const response = await api.get<MeuAgendamento[]>("/agendamentos/cliente/meus");
    // Retorna response.data.
    return response.data;
  },

  async atualizarMeu(id: number, dados: AtualizarMeuAgendamento): Promise<void> {
    // Aguarda operação assíncrona: api.put(`/agendamentos/cliente/meus/${id}`, dados);.
    await api.put(`/agendamentos/cliente/meus/${id}`, dados);
  },

  async cancelarMeu(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.patch(`/agendamentos/cliente/meus/${id}/cancelar`);.
    await api.patch(`/agendamentos/cliente/meus/${id}/cancelar`);
  },

  async atualizarStatus(
    id: number,
    status: StatusAgendamentoCompleto
  ): Promise<void> {
    // Aguarda operação assíncrona: api.patch(`/agendamentos/usuario/${id}/status`, { status });.
    await api.patch(`/agendamentos/usuario/${id}/status`, { status });
  },

  async listarAdmin(): Promise<AgendamentoAdministrativo[]> {
    // Declara constante 'response'.
    const response = await api.get<AgendamentoAdministrativo[]>(
      "/agendamentos/admin"
    );

    // Retorna response.data.
    return response.data;
  },

  async listarAdminDashboard(): Promise<AgendamentoDashboard[]> {
    // Declara constante 'response'.
    const response = await api.get<AgendamentoDashboard[]>(
      "/agendamentos/admin"
    );

    // Retorna response.data.
    return response.data;
  },

  async listarAdminPaginado(
    pagina: number,
    limite: number
  ): Promise<RespostaListagem<AgendamentoAdministrativo>> {
    // Declara constante 'response'.
    const response = await api.get<RespostaListagem<AgendamentoAdministrativo>>(
      "/agendamentos/admin",
      { params: { pagina, limite } }
    );

    // Retorna response.data.
    return response.data;
  },

  async listarHorarios(data: string): Promise<string[]> {
    // Declara constante 'response'.
    const response = await api.get<string[]>("/agendamentos/horarios", {
      params: { data },
    });

    // Retorna response.data.
    return response.data;
  },

  async criar(dados: CriarAgendamento): Promise<AgendamentoCriado> {
    // Declara constante 'response'.
    const response = await api.post<AgendamentoCriado>(
      "/agendamentos/cadastro",
      dados
    );

    // Retorna response.data.
    return response.data;
  },

  async criarAdmin(dados: CriarAgendamentoAdmin): Promise<AgendamentoCriado> {
    // Declara constante 'response'.
    const response = await api.post<AgendamentoCriado>(
      "/agendamentos/admin",
      dados
    );
    // Retorna response.data.
    return response.data;
  },

  async atualizarAdmin(
    id: number,
    dados: CriarAgendamentoAdmin & { status: StatusAgendamento }
  ): Promise<void> {
    // Aguarda operação assíncrona: api.put(`/agendamentos/admin/${id}`, dados);.
    await api.put(`/agendamentos/admin/${id}`, dados);
  },

  async cancelarAdmin(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.delete(`/agendamentos/admin/${id}`);.
    await api.delete(`/agendamentos/admin/${id}`);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend para agendamentos.
