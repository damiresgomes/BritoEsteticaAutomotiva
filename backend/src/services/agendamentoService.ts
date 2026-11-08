import { AppError } from "../errors/AppError";
import {
  atualizarAgendamentoCliente,
  atualizarStatusAgendamento,
  buscarAgendamentoCliente,
  buscarAgendamentoPorId,
  criarAgendamento,
  existeConflitoHorario,
  listarAgendamentosCliente,
  listarTodosAgendamentos, listarHorariosOcupados
} from "../repositories/agendamentoRepository";
import { CriarAgendamentoInput, StatusAgendamento } from "../schemas/agendamentoSchema";

const CATEGORIA_PRINCIPAL = 1;
const CATEGORIA_EXTRA = 2;

const HORARIOS_FUNCIONAMENTO = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

function agora() {
  const texto = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
  return { data: texto.slice(0, 10), hora: texto.slice(11, 16) };
}

export async function listarHorariosDisponiveis(data: string): Promise<string[]> {
  const { data: hoje, hora: horaAtual } = agora();

  if (data < hoje) return [];

  const ocupados = await listarHorariosOcupados(data);

  return HORARIOS_FUNCIONAMENTO.filter(
    (horario) =>
      !ocupados.includes(horario) && !(data === hoje && horario <= horaAtual)
  );
}



const TRANSICOES_PERMITIDAS: Record<StatusAgendamento, StatusAgendamento[]> = {
  Pendente: ["Confirmado", "Cancelado"],
  Confirmado: ["Em atendimento", "Cancelado"],
  "Em atendimento": ["Concluído"],
  Concluído: [],
  Cancelado: [],
};

function garantirAgendamentoNaoIniciado(status: StatusAgendamento): void {
  if (status !== "Pendente" && status !== "Confirmado") {
    throw new AppError(409, `Não é possível alterar um agendamento com status ${status}.`);
  }
}

async function garantirHorarioLivre(dataHora: string, idIgnorado?: number): Promise<void> {
  if (await existeConflitoHorario(dataHora, idIgnorado)) {
    throw new AppError(409, "Já existe um agendamento nesse horário.");
  }
}

export async function cadastrarAgendamento(id_cliente: number, dados: CriarAgendamentoInput): Promise<number> {
  await garantirHorarioLivre(dados.data_hora);
  return criarAgendamento(id_cliente, dados);
}

export async function listarMeusAgendamentos(id_cliente: number) {
  return listarAgendamentosCliente(id_cliente);
}

export async function listarAgendamentosUsuario() {
  return listarTodosAgendamentos();
}

export async function buscarMeuAgendamento(id_agendamento: number, id_cliente: number) {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) throw new AppError(404, "Agendamento não encontrado.");
  return agendamento;
}

export async function atualizarMeuAgendamento(
  id_agendamento: number,
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<void> {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) throw new AppError(404, "Agendamento não encontrado.");

  garantirAgendamentoNaoIniciado(agendamento.status);
  await garantirHorarioLivre(dados.data_hora, id_agendamento);
  await atualizarAgendamentoCliente(id_agendamento, id_cliente, dados);
}

export async function cancelarMeuAgendamento(id_agendamento: number, id_cliente: number): Promise<void> {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) throw new AppError(404, "Agendamento não encontrado.");

  garantirAgendamentoNaoIniciado(agendamento.status);
  await atualizarStatusAgendamento(id_agendamento, "Cancelado");
}

export async function atualizarStatus(id_agendamento: number, novoStatus: StatusAgendamento): Promise<void> {
  const agendamento = await buscarAgendamentoPorId(id_agendamento);
  if (!agendamento) throw new AppError(404, "Agendamento não encontrado.");

  if (!TRANSICOES_PERMITIDAS[agendamento.status].includes(novoStatus)) {
    throw new AppError(409, `Não é possível alterar o status de ${agendamento.status} para ${novoStatus}.`);
  }

  await atualizarStatusAgendamento(id_agendamento, novoStatus);
}
