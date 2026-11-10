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
  request: Request,
  response: Response
): Promise<Response> {
  const { data } = horariosQuerySchema.parse(request.query);
  return response.status(200).json(await listarHorariosDisponiveis(data));
}

export async function cadastrarAgendamentoController(
  request: Request,
  response: Response
): Promise<Response> {
  const sessao = request.usuario;
  if (!sessao?.clienteId) {
    throw new AppError(403, "A conta não possui um cadastro de cliente válido");
  }

  const dados = cadastroAgendamentoSchema.parse(request.body);
  const resultado = await cadastrarAgendamento(dados, sessao.clienteId);
  return response.status(201).json({
    message: "Agendamento realizado com sucesso",
    ...resultado,
  });
}

export async function listarAgendamentosAdminController(
  _request: Request,
  response: Response
): Promise<Response> {
  return response.status(200).json(await listarAgendamentosAdministrativos());
}

export async function cadastrarAgendamentoAdminController(
  request: Request,
  response: Response
): Promise<Response> {
  const dados = cadastroAgendamentoAdminSchema.parse(request.body);
  const { clienteId, ...agendamento } = dados;
  const resultado = await cadastrarAgendamento(agendamento, clienteId);
  return response.status(201).json({
    message: "Agendamento cadastrado com sucesso.",
    ...resultado,
  });
}

export async function atualizarAgendamentoAdminController(
  request: Request,
  response: Response
): Promise<Response> {
  const dados = atualizarAgendamentoAdminSchema.parse(request.body);
  const { clienteId, ...agendamento } = dados;
  await atualizarAgendamentoAdministrativo(Number(request.params.id), {
    ...agendamento,
    clienteId,
  });
  return response.status(200).json({ message: "Agendamento atualizado com sucesso." });
}

export async function cancelarAgendamentoAdminController(
  request: Request,
  response: Response
): Promise<Response> {
  await cancelarAgendamentoAdministrativo(Number(request.params.id));
  return response.status(200).json({ message: "Agendamento cancelado com sucesso." });
}

export async function criarAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const dados = criarAgendamentoSchema.parse(request.body);
  const id = await cadastrarAgendamentoCliente(request.cliente.id, dados);
  return response.status(201).json({ message: "Agendamento solicitado.", id, status: "Pendente" });
}

export async function listarMeusAgendamentosController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { agendamentos, total } = await listarMeusAgendamentos(request.cliente.id, pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(agendamentos, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function buscarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const id = validarId(request.params.id, "agendamento");

  const agendamento = await buscarMeuAgendamento(id, request.cliente.id);
  return response.status(200).json(agendamento);
}

export async function atualizarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const id = validarId(request.params.id, "agendamento");

  const dados = criarAgendamentoSchema.parse(request.body);
  await atualizarMeuAgendamento(id, request.cliente.id, dados);

  return response.status(200).json({ message: "Agendamento atualizado.", id });
}

export async function cancelarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const id = validarId(request.params.id, "agendamento");

  await cancelarMeuAgendamento(id, request.cliente.id);
  return response.status(200).json({ message: "Agendamento cancelado.", id, status: "Cancelado" });
}

export async function listarAgendamentosUsuarioController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { agendamentos, total } = await listarAgendamentosUsuario(pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(agendamentos, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function atualizarStatusAgendamentoController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "agendamento");
  const { status } = atualizarStatusAgendamentoSchema.parse(request.body);
  await atualizarStatus(id, status);
  return response.status(200).json({ message: "Status atualizado.", id, status });
}
