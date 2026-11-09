import { Request, Response } from "express";
import { NaoAutorizadoError } from "../errors/AppError";
import {
  atualizarStatusAgendamentoSchema,
  criarAgendamentoSchema,
  horariosQuerySchema,
} from "../schemas/agendamentoSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  atualizarMeuAgendamento,
  atualizarStatus,
  buscarMeuAgendamento,
  cadastrarAgendamento,
  cancelarMeuAgendamento,
  listarAgendamentosUsuario,
  listarHorariosDisponiveis,
  listarMeusAgendamentos,
} from "../services/agendamentoService";

export async function listarHorariosController(request: Request, response: Response): Promise<Response> {
  const { data } = horariosQuerySchema.parse(request.query);
  return response.status(200).json(await listarHorariosDisponiveis(data));
}

export async function criarAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new NaoAutorizadoError("Autenticação de cliente necessária.");
  const dados = criarAgendamentoSchema.parse(request.body);
  const id = await cadastrarAgendamento(request.cliente.id, dados);
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
