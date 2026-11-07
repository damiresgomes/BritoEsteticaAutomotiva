import { AppError } from "../errors/AppError";
import { CadastroAgendamentoInput } from "../schemas/agendamentoSchema";
import { buscarServicosPorIds } from "../repositories/servicoRepository";
import {
  criarAgendamentoCompleto,
  listarHorariosOcupados,
} from "../repositories/agendamentoRepository";

const CATEGORIA_PRINCIPAL = 1;
const CATEGORIA_EXTRA = 2;

// Horários de funcionamento: altere aqui quando precisar
const HORARIOS_FUNCIONAMENTO = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

// Data e hora de agora no fuso do Brasil: "2026-11-05 14:30:00"
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
  const horariosLivres = await listarHorariosDisponiveis(dados.data);

  if (!horariosLivres.includes(dados.horario)) {
    throw new AppError(409, "Horário indisponível. Escolha outro horário.");
  }

  const idsExtras = [...new Set(dados.extras)];
  const servicos = await buscarServicosPorIds([dados.servicoId, ...idsExtras]);

  const principal = servicos.find((s) => s.id_servico === dados.servicoId);
  if (!principal || principal.id_categoria !== CATEGORIA_PRINCIPAL) {
    throw new AppError(400, "Serviço inválido.");
  }

  const extras = servicos.filter((s) => idsExtras.includes(s.id_servico));
  if (
    extras.length !== idsExtras.length ||
    extras.some((s) => s.id_categoria !== CATEGORIA_EXTRA)
  ) {
    throw new AppError(400, "Acréscimo inválido.");
  }

  const id = await criarAgendamentoCompleto({
    id_cliente: clienteId,
    placa_veiculo: dados.placa,
    modelo_veiculo: dados.veiculo,
    observacoes: dados.observacoes,
    data_hora: `${dados.data} ${dados.horario}:00`,
    ids_servicos: [dados.servicoId, ...idsExtras],
  });

  if (id === null) {
    throw new AppError(409, "Este horário acabou de ser reservado. Escolha outro.");
  }

  // O total é calculado aqui, a partir dos preços do banco
  const total = servicos.reduce((soma, s) => soma + (s.preco ?? 0), 0);

  return { id, total };
}