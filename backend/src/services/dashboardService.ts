import { listarAgendamentosCliente } from "../repositories/agendamentoRepository";
import { buscarResumoUsuario } from "../repositories/dashboardRepository";

export async function obterDashboardUsuario() {
  return buscarResumoUsuario();
}

export async function obterDashboardCliente(id_cliente: number) {
  const agendamentos = await listarAgendamentosCliente(id_cliente);
  const agora = Date.now();
  const dataEmMs = (data: string) => new Date(`${data.replace(" ", "T")}Z`).getTime();

  return {
    totais: {
      todos: agendamentos.length,
      pendentes: agendamentos.filter((item) => item.status === "Pendente").length,
      confirmados: agendamentos.filter((item) => item.status === "Confirmado").length,
      emAtendimento: agendamentos.filter((item) => item.status === "Em atendimento").length,
      concluidos: agendamentos.filter((item) => item.status === "Concluído").length,
      cancelados: agendamentos.filter((item) => item.status === "Cancelado").length,
    },
    proximosAgendamentos: agendamentos
      .filter((item) => dataEmMs(item.data_hora) >= agora)
      .sort((a, b) => dataEmMs(a.data_hora) - dataEmMs(b.data_hora))
      .slice(0, 5),
    ultimosAgendamentos: agendamentos
      .filter((item) => dataEmMs(item.data_hora) < agora)
      .sort((a, b) => dataEmMs(b.data_hora) - dataEmMs(a.data_hora))
      .slice(0, 5),
  };
}
