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
  status: StatusAgendamento;
}

export type StatusAgendamento =
  | "Pendente"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

export interface AgendamentoAdministrativo {
  id: number;
  cliente: string;
  servico: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
}

interface ServicoAgendadoApi {
  id_servico: number;
  nome_servico: string;
  preco: number;
}

interface AgendamentoResumoApi {
  id_agendamento: number;
  data_hora: string;
  placa_veiculo: string | null;
  modelo_veiculo: string | null;
  status: StatusAgendamento;
  id_cliente: number;
  nome_cliente?: string;
  servicos: ServicoAgendadoApi[];
}

interface CriarAgendamentoApi {
  data_hora: string;
  placa_veiculo: string;
  modelo_veiculo: string;
  servicos: number[];
}

function converterParaAdministrativo(
  agendamento: AgendamentoResumoApi
): AgendamentoAdministrativo {
  return {
    id: agendamento.id_agendamento,
    cliente:
      agendamento.nome_cliente ?? `Cliente #${agendamento.id_cliente}`,
    servico:
      agendamento.servicos.map((servico) => servico.nome_servico).join(", ") ||
      "—",
    data: agendamento.data_hora.slice(0, 10),
    horario: agendamento.data_hora.slice(11, 16),
    status: agendamento.status,
  };
}

function converterParaApi(dados: CriarAgendamento): CriarAgendamentoApi {
  return {
    data_hora: new Date(`${dados.data}T${dados.horario}:00`).toISOString(),
    placa_veiculo: dados.placa,
    modelo_veiculo: dados.veiculo,
    servicos: [dados.servicoId, ...dados.extras],
  };
}

export const agendamentoService = {
  async listarAdmin(): Promise<AgendamentoAdministrativo[]> {
    const response = await api.get<AgendamentoResumoApi[]>(
      "/agendamentos/usuario"
    );

    return response.data.map(converterParaAdministrativo);
  },

  async listarHorarios(data: string): Promise<string[]> {
    const response = await api.get<string[]>("/agendamentos/horarios", {
      params: { data },
    });

    return response.data;
  },

  async criar(dados: CriarAgendamento): Promise<AgendamentoCriado> {
    const response = await api.post<AgendamentoCriado>(
      "/agendamentos/cliente",
      converterParaApi(dados)
    );

    return response.data;
  },
};
