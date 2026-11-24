import { listarAgendamentosCliente } from "../repositories/agendamentoRepository";
import { buscarResumoUsuario } from "../repositories/dashboardRepository";

// Exporta a função assíncrona 'obterDashboardUsuario'(); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function obterDashboardUsuario() {
  // Retorna buscarResumoUsuario() para quem chamou esta função.
  return buscarResumoUsuario();
}

// Exporta a função assíncrona 'obterDashboardCliente'(id_cliente: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function obterDashboardCliente(id_cliente: number) {
  const { agendamentos } = await listarAgendamentosCliente(id_cliente);
  // Cria a constante local 'agora'; usar const evita reatribuição acidental.
  const agora = Date.now();
  // Cria a constante local 'dataEmMs'; usar const evita reatribuição acidental.
  const dataEmMs = (data: string) => new Date(`${data.replace(" ", "T")}Z`).getTime();

  return {
    totais: {
      // Define a propriedade/campo 'todos' no objeto/estrutura.
      todos: agendamentos.length,
      // Define a propriedade/campo 'pendentes' no objeto/estrutura.
      pendentes: agendamentos.filter((item) => item.status === "Pendente").length,
      // Define a propriedade/campo 'confirmados' no objeto/estrutura.
      confirmados: agendamentos.filter((item) => item.status === "Confirmado").length,
      // Define a propriedade/campo 'emAtendimento' no objeto/estrutura.
      emAtendimento: agendamentos.filter((item) => item.status === "Em atendimento").length,
      // Define a propriedade/campo 'concluidos' no objeto/estrutura.
      concluidos: agendamentos.filter((item) => item.status === "Concluído").length,
      // Define a propriedade/campo 'cancelados' no objeto/estrutura.
      cancelados: agendamentos.filter((item) => item.status === "Cancelado").length,
    },
    // Define a propriedade/campo 'proximosAgendamentos' no objeto/estrutura.
    proximosAgendamentos: agendamentos
      // Executa: .filter((item) => dataEmMs(item.dataHora) >= agora).
      .filter((item) => dataEmMs(item.dataHora) >= agora)
      // Executa: .sort((a, b) => dataEmMs(a.dataHora) - dataEmMs(b.dataHora)).
      .sort((a, b) => dataEmMs(a.dataHora) - dataEmMs(b.dataHora))
      // Executa: .slice(0, 5),.
      .slice(0, 5),
    // Define a propriedade/campo 'ultimosAgendamentos' no objeto/estrutura.
    ultimosAgendamentos: agendamentos
      // Executa: .filter((item) => dataEmMs(item.dataHora) < agora).
      .filter((item) => dataEmMs(item.dataHora) < agora)
      // Executa: .sort((a, b) => dataEmMs(b.dataHora) - dataEmMs(a.dataHora)).
      .sort((a, b) => dataEmMs(b.dataHora) - dataEmMs(a.dataHora))
      // Executa: .slice(0, 5),.
      .slice(0, 5),
  };
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Monta dados do dashboard administrativo, agregando informações de agendamentos/serviços/clientes conforme repositórios.
