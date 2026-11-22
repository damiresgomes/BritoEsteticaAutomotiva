import api from "./api";
import type { RespostaListagem } from "./listagem";

export interface CriarAgendamento {
  placa: string;
  veiculo: string;
  servicoId: number;
  data: string;
  horario: string;
  observacoes?: string;
  extras: number[];
}

export interface AgendamentoCriado {
  message: string;
  id: number;
  total: number;
}

export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado";

export type StatusAgendamentoCompleto =
  | "Pendente"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

export type StatusMeuAgendamento = StatusAgendamentoCompleto;

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

export interface AtualizarMeuAgendamento {
  data_hora: string;
  placa_veiculo: string;
  modelo_veiculo: string;
  servicos: number[];
}

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

export interface AgendamentoDashboard
  extends Omit<AgendamentoAdministrativo, "status"> {
  status: StatusAgendamentoCompleto;
}

export interface CriarAgendamentoAdmin extends CriarAgendamento {
  clienteId: number;
}

export const agendamentoService = {
  async listarMeus(): Promise<MeuAgendamento[]> {
    const response = await api.get<MeuAgendamento[]>("/agendamentos/cliente/meus");
    return response.data;
  },

  async atualizarMeu(id: number, dados: AtualizarMeuAgendamento): Promise<void> {
    await api.put(`/agendamentos/cliente/meus/${id}`, dados);
  },

  async cancelarMeu(id: number): Promise<void> {
    await api.patch(`/agendamentos/cliente/meus/${id}/cancelar`);
  },

  async atualizarStatus(
    id: number,
    status: StatusAgendamentoCompleto
  ): Promise<void> {
    await api.patch(`/agendamentos/usuario/${id}/status`, { status });
  },

  async listarAdmin(): Promise<AgendamentoAdministrativo[]> {
    const response = await api.get<AgendamentoAdministrativo[]>(
      "/agendamentos/admin"
    );

    return response.data;
  },

  async listarAdminDashboard(): Promise<AgendamentoDashboard[]> {
    const response = await api.get<AgendamentoDashboard[]>(
      "/agendamentos/admin"
    );

    return response.data;
  },

  async listarAdminPaginado(
    pagina: number,
    limite: number
  ): Promise<RespostaListagem<AgendamentoAdministrativo>> {
    const response = await api.get<RespostaListagem<AgendamentoAdministrativo>>(
      "/agendamentos/admin",
      { params: { pagina, limite } }
    );

    return response.data;
  },

  async listarHorarios(data: string): Promise<string[]> {
    const response = await api.get<string[]>("/agendamentos/horarios", {
      params: { data },
    });

    return response.data;
  },

  async criar(dados: CriarAgendamento): Promise<AgendamentoCriado> {
    const response = await api.post<AgendamentoCriado>(
      "/agendamentos/cadastro",
      dados
    );

    return response.data;
  },

  async criarAdmin(dados: CriarAgendamentoAdmin): Promise<AgendamentoCriado> {
    const response = await api.post<AgendamentoCriado>(
      "/agendamentos/admin",
      dados
    );
    return response.data;
  },

  async atualizarAdmin(
    id: number,
    dados: CriarAgendamentoAdmin & { status: StatusAgendamento }
  ): Promise<void> {
    await api.put(`/agendamentos/admin/${id}`, dados);
  },

  async cancelarAdmin(id: number): Promise<void> {
    await api.delete(`/agendamentos/admin/${id}`);
  },
};
