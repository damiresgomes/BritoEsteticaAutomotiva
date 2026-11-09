import { Request, Response } from "express";
import {
  atualizarAgendamentoAdminSchema,
  cadastroAgendamentoAdminSchema,
  cadastroAgendamentoSchema,
  horariosQuerySchema,
} from "../schemas/agendamentoSchema";
import {
  atualizarStatusAdministrativo,
  atualizarAgendamentoAdministrativo,
  cadastrarAgendamento,
  cancelarAgendamentoAdministrativo,
  listarAgendamentosAdministrativos,
  listarHorariosDisponiveis,
} from "../services/agendamentoService";
import { AppError } from "../errors/AppError";

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
