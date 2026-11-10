import { AppError, ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import { CadastroAgendamentoInput, CriarAgendamentoInput } from "../schemas/agendamentoSchema";
import { buscarServicosPorIds } from "../repositories/servicoRepository";
import {
  atualizarAgendamentoCliente,
  atualizarAgendamentoCompleto,
  atualizarStatusAgendamento,
  buscarAgendamentoCliente,
  buscarAgendamentoPorId,
  buscarStatusAgendamento,
  criarAgendamento,
  criarAgendamentoCompleto,
  existeConflitoHorario,
  listarAgendamentosAdmin,
  listarAgendamentosCliente,
  listarHorariosOcupados,
  listarTodosAgendamentos,
} from "../repositories/agendamentoRepository";
import { Agendamento, StatusAgendamento } from "../entities/agendamento";
import { Carro } from "../entities/carro";

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

async function garantirHorarioLivre(dataHora: string, idIgnorado?: number): Promise<void> {
  if (await existeConflitoHorario(dataHora, idIgnorado)) {
    throw new ConflitoError("Já existe um agendamento nesse horário.");
  }
}

export async function cadastrarAgendamentoCliente(
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<number> {
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

  agendamento.transitarPara(novoStatus);

  const linhasAfetadas = await atualizarStatusAgendamento(id_agendamento, novoStatus);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização de status.");
  }
}

export async function cadastrarAgendamento(
  dados: CadastroAgendamentoInput,
  clienteId: number
): Promise<{ id: number; total: number }> {
  validarHorarioFuncionamento(dados.horario);
  const horariosLivres = await listarHorariosDisponiveis(dados.data);
  if (!horariosLivres.includes(dados.horario)) {
    throw new AppError(409, "Horário indisponível. Escolha outro horário.");
  }

  const { servicos, idsServicos } = await validarServicosSelecionados(dados);

  const id = await criarAgendamentoCompleto({
    id_cliente: clienteId,
    placa_veiculo: dados.placa,
    modelo_veiculo: dados.veiculo,
    observacoes: dados.observacoes,
    data_hora: `${dados.data} ${dados.horario}:00`,
    ids_servicos: idsServicos,
  });

  if (id === null) {
    throw new AppError(409, "Este horário acabou de ser reservado. Escolha outro.");
  }

  const total = servicos.reduce((soma, servico) => soma + (servico.preco ?? 0), 0);
  return { id, total };
}

async function validarServicosSelecionados(dados: CadastroAgendamentoInput) {
  const idsExtras = [...new Set(dados.extras)];
  const servicos = await buscarServicosPorIds([dados.servicoId, ...idsExtras]);
  const principal = servicos.find((servico) => servico.id === dados.servicoId);

  if (!principal || principal.idCategoria !== CATEGORIA_PRINCIPAL) {
    throw new AppError(400, "Serviço inválido.");
  }

  const extras = servicos.filter((servico) => idsExtras.includes(servico.id));
  if (
    extras.length !== idsExtras.length ||
    extras.some((servico) => servico.idCategoria !== CATEGORIA_EXTRA)
  ) {
    throw new AppError(400, "Acréscimo inválido.");
  }

  return {
    servicos,
    idsServicos: [dados.servicoId, ...idsExtras],
  };
}

function validarHorarioFuncionamento(horario: string): void {
  if (!HORARIOS_FUNCIONAMENTO.includes(horario)) {
    throw new AppError(400, "Horário fora do funcionamento da empresa.");
  }
}

export async function listarAgendamentosAdministrativos() {
  return listarAgendamentosAdmin();
}

export async function atualizarAgendamentoAdministrativo(
  id: number,
  dados: CadastroAgendamentoInput & {
    clienteId: number;
    status: "Pendente" | "Confirmado" | "Cancelado";
  }
): Promise<void> {
  validarHorarioFuncionamento(dados.horario);
  const statusAtual = await buscarStatusAgendamento(id);
  if (!statusAtual) throw new AppError(404, "Agendamento não encontrado.");
  if (statusAtual === "Cancelado" && dados.status !== "Cancelado") {
    throw new AppError(409, "Agendamento cancelado não pode ser reativado.");
  }

  const { idsServicos } = await validarServicosSelecionados(dados);
  if (dados.status !== "Cancelado") {
    const horariosLivres = await listarHorariosOcupados(dados.data, id);
    const { data: hoje, hora: horaAtual } = agora();
    const horarioOcupado = horariosLivres.includes(dados.horario);
    const horarioNoPassado = dados.data < hoje ||
      (dados.data === hoje && dados.horario <= horaAtual);
    if (horarioOcupado || horarioNoPassado) {
      throw new AppError(409, "Horário indisponível. Escolha outro horário.");
    }
  }

  const resultado = await atualizarAgendamentoCompleto(
    id,
    {
      id_cliente: dados.clienteId,
      placa_veiculo: dados.placa,
      modelo_veiculo: dados.veiculo,
      observacoes: dados.observacoes,
      data_hora: `${dados.data} ${dados.horario}:00`,
      ids_servicos: idsServicos,
    },
    dados.status
  );
  if (resultado === "nao-encontrado") {
    throw new AppError(404, "Agendamento não encontrado.");
  }
  if (resultado === "horario-ocupado") {
    throw new AppError(409, "Este horário acabou de ser reservado. Escolha outro.");
  }
}

export async function atualizarStatusAdministrativo(
  id: number,
  status: "Pendente" | "Confirmado" | "Cancelado"
): Promise<void> {
  const statusAtual = await buscarStatusAgendamento(id);
  if (!statusAtual) throw new AppError(404, "Agendamento não encontrado.");
  if (statusAtual === "Cancelado" && status !== "Cancelado") {
    throw new AppError(409, "Agendamento cancelado não pode ser reativado.");
  }
  await atualizarStatusAgendamento(id, status);
}

export async function cancelarAgendamentoAdministrativo(id: number): Promise<void> {
  await atualizarStatusAdministrativo(id, "Cancelado");
}
