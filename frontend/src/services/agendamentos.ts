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
  cliente: string;
  servico: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
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
};
