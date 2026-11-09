import { AppError } from "../errors/AppError";
import { CadastroAgendamentoInput } from "../schemas/agendamentoSchema";
import { buscarServicosPorIds } from "../repositories/servicoRepository";
import {
  atualizarAgendamentoCompleto,
  atualizarStatusAgendamento,
  buscarStatusAgendamento,
  criarAgendamentoCompleto,
  listarAgendamentosAdmin,
  listarHorariosOcupados,
} from "../repositories/agendamentoRepository";

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
  const principal = servicos.find((servico) => servico.id_servico === dados.servicoId);

  if (!principal || principal.id_categoria !== CATEGORIA_PRINCIPAL) {
    throw new AppError(400, "Serviço inválido.");
  }

  const extras = servicos.filter((servico) => idsExtras.includes(servico.id_servico));
  if (
    extras.length !== idsExtras.length ||
    extras.some((servico) => servico.id_categoria !== CATEGORIA_EXTRA)
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
