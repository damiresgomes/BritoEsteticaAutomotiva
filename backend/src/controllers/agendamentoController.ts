import { Request, Response } from "express";
import {
  cadastroAgendamentoSchema,
  horariosQuerySchema,
} from "../schemas/agendamentoSchema";
import {
  cadastrarAgendamento,
  listarHorariosDisponiveis,
} from "../services/agendamentoService";
import { AppError } from "../errors/AppError";

export async function listarHorariosController(request: Request, response: Response): Promise<Response> {
  const { data } = horariosQuerySchema.parse(request.query);
  const horarios = await listarHorariosDisponiveis(data);

  return response.status(200).json(horarios);
}

export async function cadastrarAgendamentoController(request: Request, response: Response): Promise<Response> {
  const sessao = request.usuario;
  if (!sessao?.clienteId) {
    throw new AppError(403, "A conta não possui um cadastro de cliente válido");
  }

  const dados = cadastroAgendamentoSchema.parse(request.body);
  const { id, total } = await cadastrarAgendamento(dados, sessao.clienteId);

  return response.status(201).json({
    message: "Agendamento realizado com sucesso",
    id,
    total,
  });
}