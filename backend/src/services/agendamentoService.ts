import { ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  atualizarAgendamentoCliente,
  atualizarStatusAgendamento,
  buscarAgendamentoCliente,
  buscarAgendamentoPorId,
  criarAgendamento,
  existeConflitoHorario,
  listarAgendamentosCliente,
  listarTodosAgendamentos,
  listarHorariosOcupados,
} from "../repositories/agendamentoRepository";
import { CriarAgendamentoInput } from "../schemas/agendamentoSchema";
import { Agendamento, StatusAgendamento } from "../entities/agendamento";
import { Carro } from "../entities/carro";

const HORARIOS_FUNCIONAMENTO = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
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
    (horario) => !ocupados.includes(horario) && !(data === hoje && horario <= horaAtual)
  );
}

async function garantirHorarioLivre(dataHora: string, idIgnorado?: number): Promise<void> {
  if (await existeConflitoHorario(dataHora, idIgnorado)) {
    throw new ConflitoError("Já existe um agendamento nesse horário.");
  }
}

export async function cadastrarAgendamento(
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<number> {
  // Instancia carro para validação de dados de veículo
  new Carro(dados.placa_veiculo, dados.modelo_veiculo);

  await garantirHorarioLivre(dados.data_hora);
  return criarAgendamento(id_cliente, dados);
}

export async function listarMeusAgendamentos(id_cliente: number, pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  return listarAgendamentosCliente(id_cliente, limite, offset);
}

export async function listarAgendamentosUsuario(pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  return listarTodosAgendamentos(limite, offset);
}

export async function buscarMeuAgendamento(
  id_agendamento: number,
  id_cliente: number
): Promise<Agendamento> {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }
  return agendamento;
}

export async function atualizarMeuAgendamento(
  id_agendamento: number,
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<void> {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Aciona regra de negócio encapsulada na entidade
  const novoCarro = new Carro(dados.placa_veiculo, dados.modelo_veiculo);
  agendamento.atualizarDados(dados.data_hora, novoCarro);

  await garantirHorarioLivre(dados.data_hora, id_agendamento);
  const linhasAfetadas = await atualizarAgendamentoCliente(id_agendamento, id_cliente, dados);

  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização.");
  }
}

export async function cancelarMeuAgendamento(
  id_agendamento: number,
  id_cliente: number
): Promise<void> {
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  if (!agendamento) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Executa validação de transição na entidade de domínio
  agendamento.cancelar();

  const linhasAfetadas = await atualizarStatusAgendamento(id_agendamento, "Cancelado");
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para cancelamento.");
  }
}

export async function atualizarStatus(
  id_agendamento: number,
  novoStatus: StatusAgendamento
): Promise<void> {
  const agendamento = await buscarAgendamentoPorId(id_agendamento);
  if (!agendamento) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Valida e aplica a transição através da máquina de estados da classe Agendamento
  agendamento.transitarPara(novoStatus);

  const linhasAfetadas = await atualizarStatusAgendamento(id_agendamento, novoStatus);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização de status.");
  }
}
