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
  contarAgendamentosAdmin,
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

// Cria a constante local 'CATEGORIA_PRINCIPAL'; usar const evita reatribuição acidental.
const CATEGORIA_PRINCIPAL = 1;
// Cria a constante local 'CATEGORIA_EXTRA'; usar const evita reatribuição acidental.
const CATEGORIA_EXTRA = 2;

// Cria a constante local 'HORARIOS_FUNCIONAMENTO'; usar const evita reatribuição acidental.
const HORARIOS_FUNCIONAMENTO = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

// Declara a função local 'agora'() para encapsular lógica reutilizável neste arquivo.
function agora() {
  // Cria a constante local 'texto'; usar const evita reatribuição acidental.
  const texto = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
  // Retorna { data: texto.slice(0, 10), hora: texto.slice(11, 16) } para quem chamou esta função.
  return { data: texto.slice(0, 10), hora: texto.slice(11, 16) };
}

// Declara a função local 'garantirCancelamentoPendente'(statusAtual: string) para encapsular lógica reutilizável neste arquivo.
function garantirCancelamentoPendente(statusAtual: string): void {
  // Condição: se 'statusAtual !== "Pendente"' for verdadeira, o bloco abaixo é executado.
  if (statusAtual !== "Pendente") {
    // Lança 'ConflitoError' com ("Só é possível cancelar agendamentos com status pendente."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Só é possível cancelar agendamentos com status pendente.");
  }
}

// Exporta a função assíncrona 'listarHorariosDisponiveis'(data: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarHorariosDisponiveis(data: string): Promise<string[]> {
  const { data: hoje, hora: horaAtual } = agora();
  if (data < hoje) return [];

  // Cria a constante local 'ocupados'; usar const evita reatribuição acidental.
  const ocupados = await listarHorariosOcupados(data);
  return HORARIOS_FUNCIONAMENTO.filter(
    (horario) =>
      !ocupados.includes(horario) && !(data === hoje && horario <= horaAtual)
  );
}

// Declara a função assíncrona local 'garantirHorarioLivre'(dataHora: string, idIgnorado?: number), usada internamente neste arquivo.
async function garantirHorarioLivre(dataHora: string, idIgnorado?: number): Promise<void> {
  // Condição: se 'await existeConflitoHorario(dataHora, idIgnorado)' for verdadeira, o bloco abaixo é executado.
  if (await existeConflitoHorario(dataHora, idIgnorado)) {
    // Lança 'ConflitoError' com ("Já existe um agendamento nesse horário."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Já existe um agendamento nesse horário.");
  }
}

export async function cadastrarAgendamentoCliente(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: CriarAgendamentoInput
): Promise<number> {
  new Carro(dados.placa_veiculo, dados.modelo_veiculo);
  // Aguarda conclusão da operação assíncrona: garantirHorarioLivre(dados.data_hora);.
  await garantirHorarioLivre(dados.data_hora);
  // Retorna criarAgendamento(id_cliente, dados) para quem chamou esta função.
  return criarAgendamento(id_cliente, dados);
}

// Exporta a função assíncrona 'listarMeusAgendamentos'(id_cliente: number, pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarMeusAgendamentos(id_cliente: number, pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  // Retorna listarAgendamentosCliente(id_cliente, limite, offset) para quem chamou esta função.
  return listarAgendamentosCliente(id_cliente, limite, offset);
}

// Exporta a função assíncrona 'listarAgendamentosUsuario'(pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarAgendamentosUsuario(pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  // Retorna listarTodosAgendamentos(limite, offset) para quem chamou esta função.
  return listarTodosAgendamentos(limite, offset);
}

export async function buscarMeuAgendamento(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number
): Promise<Agendamento> {
  // Cria a constante local 'agendamento'; usar const evita reatribuição acidental.
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  // Condição: se '!agendamento' for verdadeira, o bloco abaixo é executado.
  if (!agendamento) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }
  // Retorna agendamento para quem chamou esta função.
  return agendamento;
}

export async function atualizarMeuAgendamento(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: CriarAgendamentoInput
): Promise<void> {
  // Cria a constante local 'agendamento'; usar const evita reatribuição acidental.
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  // Condição: se '!agendamento' for verdadeira, o bloco abaixo é executado.
  if (!agendamento) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Aguarda conclusão da operação assíncrona: validarServicosDoCliente(dados.servicos);.
  await validarServicosDoCliente(dados.servicos);

  // Cria a constante local 'novoCarro'; usar const evita reatribuição acidental.
  const novoCarro = new Carro(dados.placa_veiculo, dados.modelo_veiculo);
  // Executa: agendamento.atualizarDados(dados.data_hora, novoCarro);.
  agendamento.atualizarDados(dados.data_hora, novoCarro);

  // Aguarda conclusão da operação assíncrona: garantirHorarioLivre(dados.data_hora, id_agendamento);.
  await garantirHorarioLivre(dados.data_hora, id_agendamento);
  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarAgendamentoCliente(id_agendamento, id_cliente, dados);

  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização.");
  }
}

export async function cancelarMeuAgendamento(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number
): Promise<void> {
  // Cria a constante local 'agendamento'; usar const evita reatribuição acidental.
  const agendamento = await buscarAgendamentoCliente(id_agendamento, id_cliente);
  // Condição: se '!agendamento' for verdadeira, o bloco abaixo é executado.
  if (!agendamento) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Executa: garantirCancelamentoPendente(agendamento.status);.
  garantirCancelamentoPendente(agendamento.status);
  // Executa: agendamento.cancelar();.
  agendamento.cancelar();

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarStatusAgendamento(id_agendamento, "Cancelado");
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado para cancelamento."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para cancelamento.");
  }
}

export async function atualizarStatus(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'novoStatus' no objeto/estrutura.
  novoStatus: StatusAgendamento
): Promise<void> {
  // Cria a constante local 'agendamento'; usar const evita reatribuição acidental.
  const agendamento = await buscarAgendamentoPorId(id_agendamento);
  // Condição: se '!agendamento' for verdadeira, o bloco abaixo é executado.
  if (!agendamento) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado.");
  }

  // Executa: agendamento.transitarPara(novoStatus);.
  agendamento.transitarPara(novoStatus);

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarStatusAgendamento(id_agendamento, novoStatus);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado para atualização de status."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização de status.");
  }
}

export async function cadastrarAgendamento(
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: CadastroAgendamentoInput,
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: number
): Promise<{ id: number; total: number }> {
  // Executa: validarHorarioFuncionamento(dados.horario);.
  validarHorarioFuncionamento(dados.horario);
  // Cria a constante local 'horariosLivres'; usar const evita reatribuição acidental.
  const horariosLivres = await listarHorariosDisponiveis(dados.data);
  // Condição: se '!horariosLivres.includes(dados.horario)' for verdadeira, o bloco abaixo é executado.
  if (!horariosLivres.includes(dados.horario)) {
    // Lança 'AppError' com (409, "Horário indisponível. Escolha outro horário."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "Horário indisponível. Escolha outro horário.");
  }

  const { servicos, idsServicos } = await validarServicosSelecionados(dados);

  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await criarAgendamentoCompleto({
    // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
    id_cliente: clienteId,
    // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
    placa_veiculo: dados.placa,
    // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
    modelo_veiculo: dados.veiculo,
    // Define a propriedade/campo 'observacoes' no objeto/estrutura.
    observacoes: dados.observacoes,
    // Define a propriedade/campo 'data_hora' no objeto/estrutura.
    data_hora: `${dados.data} ${dados.horario}:00`,
    // Define a propriedade/campo 'ids_servicos' no objeto/estrutura.
    ids_servicos: idsServicos,
  });

  // Condição: se 'id === null' for verdadeira, o bloco abaixo é executado.
  if (id === null) {
    // Lança 'AppError' com (409, "Este horário acabou de ser reservado. Escolha outro."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "Este horário acabou de ser reservado. Escolha outro.");
  }

  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = servicos.reduce((soma, servico) => soma + (servico.preco ?? 0), 0);
  // Retorna { id, total } para quem chamou esta função.
  return { id, total };
}

// Declara a função assíncrona local 'validarServicosSelecionados'(dados: CadastroAgendamentoInput), usada internamente neste arquivo.
async function validarServicosSelecionados(dados: CadastroAgendamentoInput) {
  // Cria a constante local 'idsExtras'; usar const evita reatribuição acidental.
  const idsExtras = [...new Set(dados.extras)];
  // Cria a constante local 'servicos'; usar const evita reatribuição acidental.
  const servicos = await buscarServicosPorIds([dados.servicoId, ...idsExtras]);
  // Cria a constante local 'principal'; usar const evita reatribuição acidental.
  const principal = servicos.find((servico) => servico.id === dados.servicoId);

  // Condição: se '!principal || principal.idCategoria !== CATEGORIA_PRINCIPAL' for verdadeira, o bloco abaixo é executado.
  if (!principal || principal.idCategoria !== CATEGORIA_PRINCIPAL) {
    // Lança 'AppError' com (400, "Serviço inválido."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(400, "Serviço inválido.");
  }

  // Cria a constante local 'extras'; usar const evita reatribuição acidental.
  const extras = servicos.filter((servico) => idsExtras.includes(servico.id));
  if (
    extras.length !== idsExtras.length ||
    // Executa: extras.some((servico) => servico.idCategoria !== CATEGORIA_EXTRA).
    extras.some((servico) => servico.idCategoria !== CATEGORIA_EXTRA)
  ) {
    // Lança 'AppError' com (400, "Acréscimo inválido."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(400, "Acréscimo inválido.");
  }

  return {
    servicos,
    // Define a propriedade/campo 'idsServicos' no objeto/estrutura.
    idsServicos: [dados.servicoId, ...idsExtras],
  };
}

// Declara a função assíncrona local 'validarServicosDoCliente'(idsServicos: number[]), usada internamente neste arquivo.
async function validarServicosDoCliente(idsServicos: number[]): Promise<void> {
  // Cria a constante local 'servicos'; usar const evita reatribuição acidental.
  const servicos = await buscarServicosPorIds(idsServicos);
  // Cria a constante local 'principais'; usar const evita reatribuição acidental.
  const principais = servicos.filter((servico) => servico.idCategoria === CATEGORIA_PRINCIPAL);
  // Cria a constante local 'extras'; usar const evita reatribuição acidental.
  const extras = servicos.filter((servico) => servico.idCategoria === CATEGORIA_EXTRA);

  // Condição: se 'principais.length !== 1 || extras.length !== idsServicos.length - 1' for verdadeira, o bloco abaixo é executado.
  if (principais.length !== 1 || extras.length !== idsServicos.length - 1) {
    // Lança 'AppError' com (400, "Selecione um serviço principal e, opcionalmente, serviços extras."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(400, "Selecione um serviço principal e, opcionalmente, serviços extras.");
  }
}

// Declara a função local 'validarHorarioFuncionamento'(horario: string) para encapsular lógica reutilizável neste arquivo.
function validarHorarioFuncionamento(horario: string): void {
  // Condição: se '!HORARIOS_FUNCIONAMENTO.includes(horario)' for verdadeira, o bloco abaixo é executado.
  if (!HORARIOS_FUNCIONAMENTO.includes(horario)) {
    // Lança 'AppError' com (400, "Horário fora do funcionamento da empresa."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(400, "Horário fora do funcionamento da empresa.");
  }
}

// Exporta a função assíncrona 'listarAgendamentosAdministrativos'(pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarAgendamentosAdministrativos(pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  const [agendamentos, total] = await Promise.all([
    // Executa: listarAgendamentosAdmin(limite, offset),.
    listarAgendamentosAdmin(limite, offset),
    // Executa: contarAgendamentosAdmin(),.
    contarAgendamentosAdmin(),
  ]);
  // Retorna { agendamentos, total } para quem chamou esta função.
  return { agendamentos, total };
}

export async function atualizarAgendamentoAdministrativo(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  dados: CadastroAgendamentoInput & {
    // Define a propriedade/campo 'clienteId' no objeto/estrutura.
    clienteId: number;
    // Define a propriedade/campo 'status' no objeto/estrutura.
    status: "Pendente" | "Confirmado" | "Cancelado";
  }
): Promise<void> {
  // Executa: validarHorarioFuncionamento(dados.horario);.
  validarHorarioFuncionamento(dados.horario);
  // Cria a constante local 'statusAtual'; usar const evita reatribuição acidental.
  const statusAtual = await buscarStatusAgendamento(id);
  if (!statusAtual) throw new AppError(404, "Agendamento não encontrado.");
  // Condição: se 'statusAtual === "Cancelado" && dados.status !== "Cancelado"' for verdadeira, o bloco abaixo é executado.
  if (statusAtual === "Cancelado" && dados.status !== "Cancelado") {
    // Lança 'AppError' com (409, "Agendamento cancelado não pode ser reativado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "Agendamento cancelado não pode ser reativado.");
  }
  // Condição: se 'dados.status === "Cancelado"' for verdadeira, o bloco abaixo é executado.
  if (dados.status === "Cancelado") {
    // Executa: garantirCancelamentoPendente(statusAtual);.
    garantirCancelamentoPendente(statusAtual);
  }

  const { idsServicos } = await validarServicosSelecionados(dados);
  // Condição: se 'dados.status !== "Cancelado"' for verdadeira, o bloco abaixo é executado.
  if (dados.status !== "Cancelado") {
    // Cria a constante local 'horariosLivres'; usar const evita reatribuição acidental.
    const horariosLivres = await listarHorariosOcupados(dados.data, id);
    const { data: hoje, hora: horaAtual } = agora();
    // Cria a constante local 'horarioOcupado'; usar const evita reatribuição acidental.
    const horarioOcupado = horariosLivres.includes(dados.horario);
    // Cria a constante local 'horarioNoPassado'; usar const evita reatribuição acidental.
    const horarioNoPassado = dados.data < hoje ||
      (dados.data === hoje && dados.horario <= horaAtual);
    // Condição: se 'horarioOcupado || horarioNoPassado' for verdadeira, o bloco abaixo é executado.
    if (horarioOcupado || horarioNoPassado) {
      // Lança 'AppError' com (409, "Horário indisponível. Escolha outro horário."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new AppError(409, "Horário indisponível. Escolha outro horário.");
    }
  }

  // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
  const resultado = await atualizarAgendamentoCompleto(
    id,
    {
      // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
      id_cliente: dados.clienteId,
      // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
      placa_veiculo: dados.placa,
      // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
      modelo_veiculo: dados.veiculo,
      // Define a propriedade/campo 'observacoes' no objeto/estrutura.
      observacoes: dados.observacoes,
      // Define a propriedade/campo 'data_hora' no objeto/estrutura.
      data_hora: `${dados.data} ${dados.horario}:00`,
      // Define a propriedade/campo 'ids_servicos' no objeto/estrutura.
      ids_servicos: idsServicos,
    },
    dados.status
  );
  // Condição: se 'resultado === "nao-encontrado"' for verdadeira, o bloco abaixo é executado.
  if (resultado === "nao-encontrado") {
    // Lança 'AppError' com (404, "Agendamento não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(404, "Agendamento não encontrado.");
  }
  // Condição: se 'resultado === "horario-ocupado"' for verdadeira, o bloco abaixo é executado.
  if (resultado === "horario-ocupado") {
    // Lança 'AppError' com (409, "Este horário acabou de ser reservado. Escolha outro."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "Este horário acabou de ser reservado. Escolha outro.");
  }
}

export async function atualizarStatusAdministrativo(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: "Pendente" | "Confirmado" | "Cancelado"
): Promise<void> {
  // Cria a constante local 'statusAtual'; usar const evita reatribuição acidental.
  const statusAtual = await buscarStatusAgendamento(id);
  if (!statusAtual) throw new AppError(404, "Agendamento não encontrado.");
  // Condição: se 'statusAtual === "Cancelado" && status !== "Cancelado"' for verdadeira, o bloco abaixo é executado.
  if (statusAtual === "Cancelado" && status !== "Cancelado") {
    // Lança 'AppError' com (409, "Agendamento cancelado não pode ser reativado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(409, "Agendamento cancelado não pode ser reativado.");
  }
  // Condição: se 'status === "Cancelado"' for verdadeira, o bloco abaixo é executado.
  if (status === "Cancelado") {
    // Executa: garantirCancelamentoPendente(statusAtual);.
    garantirCancelamentoPendente(statusAtual);
  }
  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarStatusAgendamento(id, status);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Agendamento não encontrado para atualização de status."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Agendamento não encontrado para atualização de status.");
  }
}

// Exporta a função assíncrona 'cancelarAgendamentoAdministrativo'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cancelarAgendamentoAdministrativo(id: number): Promise<void> {
  // Aguarda conclusão da operação assíncrona: atualizarStatusAdministrativo(id, "Cancelado");.
  await atualizarStatusAdministrativo(id, "Cancelado");
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de negócio de agendamentos: valida disponibilidade/dados, cria e gerencia agendamentos.
