import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { atualizarStatusAgendamentoSchema, criarAgendamentoSchema, horariosQuerySchema } from "../schemas/agendamentoSchema";
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
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  const dados = criarAgendamentoSchema.parse(request.body);
  const id = await cadastrarAgendamento(request.cliente.id, dados);
  return response.status(201).json({ message: "Agendamento solicitado.", id, status: "Pendente" });
}

export async function listarMeusAgendamentosController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  return response.status(200).json(await listarMeusAgendamentos(request.cliente.id));
}

export async function buscarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  return response.status(200).json(await buscarMeuAgendamento(Number(request.params.id), request.cliente.id));
}

export async function atualizarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de agendamento inválido.");

  const dados = criarAgendamentoSchema.parse(request.body);
  await atualizarMeuAgendamento(id, request.cliente.id, dados);

  return response.status(200).json({ message: "Agendamento atualizado.", id });
}

export async function cancelarMeuAgendamentoController(request: Request, response: Response): Promise<Response> {
  if (!request.cliente) throw new AppError(401, "Autenticação de cliente necessária.");
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de agendamento inválido.");

  await cancelarMeuAgendamento(id, request.cliente.id);

  return response.status(200).json({ message: "Agendamento cancelado.", id, status: "Cancelado" });
}

export async function listarAgendamentosUsuarioController(_request: Request, response: Response): Promise<Response> {
  return response.status(200).json(await listarAgendamentosUsuario());
}

export async function atualizarStatusAgendamentoController(request: Request, response: Response): Promise<Response> {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "Agendamento inválido.");
  const { status } = atualizarStatusAgendamentoSchema.parse(request.body);
  await atualizarStatus(id, status);
  return response.status(200).json({ message: "Status atualizado.", id, status });
}
