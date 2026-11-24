import { Request, Response } from "express";
import { AppError, NaoAutorizadoError } from "../errors/AppError";
import {
  atualizarAgendamentoAdminSchema,
  atualizarStatusAgendamentoSchema,
  cadastroAgendamentoAdminSchema,
  cadastroAgendamentoSchema,
  criarAgendamentoSchema,
  horariosQuerySchema,
} from "../schemas/agendamentoSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  atualizarAgendamentoAdministrativo,
  atualizarMeuAgendamento,
  atualizarStatus,
  atualizarStatusAdministrativo,
  buscarMeuAgendamento,
  cadastrarAgendamento,
  cadastrarAgendamentoCliente,
  cancelarAgendamentoAdministrativo,
  cancelarMeuAgendamento,
  listarAgendamentosAdministrativos,
  listarAgendamentosUsuario,
  listarHorariosDisponiveis,
  listarMeusAgendamentos,
} from "../services/agendamentoService";

export async function listarHorariosController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  const { data } = horariosQuerySchema.parse(request.query);
  // Envia resposta HTTP ao cliente: response.status(200).json(await listarHorariosDisponiveis(data)).
  return response.status(200).json(await listarHorariosDisponiveis(data));
}

export async function cadastrarAgendamentoController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'sessao'; usar const evita reatribuição acidental.
  const sessao = request.usuario;
  // Condição: se '!sessao?.clienteId' for verdadeira, o bloco abaixo é executado.
  if (!sessao?.clienteId) {
    // Lança 'AppError' com (403, "A conta não possui um cadastro de cliente válido"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AppError(403, "A conta não possui um cadastro de cliente válido");
  }

  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroAgendamentoSchema.parse(request.body);
  // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
  const resultado = await cadastrarAgendamento(dados, sessao.clienteId);
  return response.status(201).json({
    // Define a propriedade/campo 'message' no objeto/estrutura.
    message: "Agendamento realizado com sucesso",
    ...resultado,
  });
}

export async function listarAgendamentosAdminController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { agendamentos, total } = await listarAgendamentosAdministrativos(pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Envia resposta HTTP ao cliente: response.status(200).json(formatarRespostaListagem(agendamentos, total, pagina, limite)).
  return response.status(200).json(formatarRespostaListagem(agendamentos, total, pagina, limite));
}

export async function cadastrarAgendamentoAdminController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroAgendamentoAdminSchema.parse(request.body);
  const { clienteId, ...agendamento } = dados;
  // Cria a constante local 'resultado'; usar const evita reatribuição acidental.
  const resultado = await cadastrarAgendamento(agendamento, clienteId);
  return response.status(201).json({
    // Define a propriedade/campo 'message' no objeto/estrutura.
    message: "Agendamento cadastrado com sucesso.",
    ...resultado,
  });
}

export async function atualizarAgendamentoAdminController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = atualizarAgendamentoAdminSchema.parse(request.body);
  const { clienteId, ...agendamento } = dados;
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");
  // Aguarda conclusão da operação assíncrona: atualizarAgendamentoAdministrativo(id, {.
  await atualizarAgendamentoAdministrativo(id, {
    ...agendamento,
    clienteId,
  });
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Agendamento atualizado com sucesso." }).
  return response.status(200).json({ message: "Agendamento atualizado com sucesso." });
}

export async function cancelarAgendamentoAdminController(
  // Define a propriedade/campo 'request' no objeto/estrutura.
  request: Request,
  // Define a propriedade/campo 'response' no objeto/estrutura.
  response: Response
): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");
  // Aguarda conclusão da operação assíncrona: cancelarAgendamentoAdministrativo(id);.
  await cancelarAgendamentoAdministrativo(id);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Agendamento cancelado com sucesso." }).
  return response.status(200).json({ message: "Agendamento cancelado com sucesso." });
}

// Exporta a função assíncrona 'criarAgendamentoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = criarAgendamentoSchema.parse(request.body);
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await cadastrarAgendamentoCliente(request.cliente.id, dados);
  // Envia resposta HTTP ao cliente: response.status(201).json({ message: "Agendamento solicitado.", id, status: "Pendente" }).
  return response.status(201).json({ message: "Agendamento solicitado.", id, status: "Pendente" });
}

// Exporta a função assíncrona 'listarMeusAgendamentosController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarMeusAgendamentosController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { agendamentos, total } = await listarMeusAgendamentos(request.cliente.id, pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Cria a constante local 'resposta'; usar const evita reatribuição acidental.
  const resposta = formatarRespostaListagem(agendamentos, total, pagina, limite);
  // Envia resposta HTTP ao cliente: response.status(200).json(resposta).
  return response.status(200).json(resposta);
}

// Exporta a função assíncrona 'buscarMeuAgendamentoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");

  // Cria a constante local 'agendamento'; usar const evita reatribuição acidental.
  const agendamento = await buscarMeuAgendamento(id, request.cliente.id);
  // Envia resposta HTTP ao cliente: response.status(200).json(agendamento).
  return response.status(200).json(agendamento);
}

// Exporta a função assíncrona 'atualizarMeuAgendamentoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");

  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = criarAgendamentoSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizarMeuAgendamento(id, request.cliente.id, dados);.
  await atualizarMeuAgendamento(id, request.cliente.id, dados);

  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Agendamento atualizado.", id }).
  return response.status(200).json({ message: "Agendamento atualizado.", id });
}

// Exporta a função assíncrona 'cancelarMeuAgendamentoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cancelarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");

  // Aguarda conclusão da operação assíncrona: cancelarMeuAgendamento(id, request.cliente.id);.
  await cancelarMeuAgendamento(id, request.cliente.id);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Agendamento cancelado.", id, status: "Cancelado" }).
  return response.status(200).json({ message: "Agendamento cancelado.", id, status: "Cancelado" });
}

// Exporta a função assíncrona 'listarAgendamentosUsuarioController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarAgendamentosUsuarioController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { agendamentos, total } = await listarAgendamentosUsuario(pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Cria a constante local 'resposta'; usar const evita reatribuição acidental.
  const resposta = formatarRespostaListagem(agendamentos, total, pagina, limite);
  // Envia resposta HTTP ao cliente: response.status(200).json(resposta).
  return response.status(200).json(resposta);
}

// Exporta a função assíncrona 'atualizarStatusAgendamentoController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarStatusAgendamentoController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "agendamento");
  const { status } = atualizarStatusAgendamentoSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizarStatus(id, status);.
  await atualizarStatus(id, status);
  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Status atualizado.", id, status }).
  return response.status(200).json({ message: "Status atualizado.", id, status });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller de agendamentos: cria, lista, atualiza status/dados e consulta agendamentos para admin e cliente.
