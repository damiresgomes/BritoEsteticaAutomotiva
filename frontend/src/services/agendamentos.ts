import api from "./api";

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

export interface CriarAgendamentoAdmin extends CriarAgendamento {
  clienteId: number;
}

export const agendamentoService = {
  async listarAdmin(): Promise<AgendamentoAdministrativo[]> {
    const response = await api.get<AgendamentoAdministrativo[]>(
      "/agendamentos/admin"
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
