import { Request, Response } from "express";
import {
  atualizacaoClienteAdminSchema,
  cadastroClienteAdminSchema,
  idClienteSchema,
} from "../schemas/clienteSchema";
import {
  ativarCliente,
  atualizarCliente,
  buscarCliente,
  cadastrarClienteAdmin,
  excluirCliente,
  listarClientes,
} from "../services/clienteService";

export async function listarClientesController(
  _request: Request,
  response: Response
): Promise<Response> {
  return response.status(200).json(await listarClientes());
}

export async function buscarClienteController(
  request: Request,
  response: Response
): Promise<Response> {
  const id = idClienteSchema.parse(request.params.id);
  return response.status(200).json(await buscarCliente(id));
}

export async function cadastrarClienteController(
  request: Request,
  response: Response
): Promise<Response> {
  const dados = cadastroClienteAdminSchema.parse(request.body);
  const id = await cadastrarClienteAdmin(dados);
  return response.status(201).json({ message: "Cliente cadastrado com sucesso.", id });
}

export async function atualizarClienteController(
  request: Request,
  response: Response
): Promise<Response> {
  const id = idClienteSchema.parse(request.params.id);
  const dados = atualizacaoClienteAdminSchema.parse(request.body);
  await atualizarCliente(id, dados);
  return response.status(200).json({ message: "Cliente atualizado com sucesso." });
}

export async function excluirClienteController(
  request: Request,
  response: Response
): Promise<Response> {
  const id = idClienteSchema.parse(request.params.id);
  const resultado = await excluirCliente(id);
  const message = resultado === "desativado"
    ? "Acesso do cliente desativado. Os dados e o histórico foram preservados."
    : "Cliente removido.";
  return response.status(200).json({ message });
}

export async function ativarClienteController(
  request: Request,
  response: Response
): Promise<Response> {
  const id = idClienteSchema.parse(request.params.id);
  await ativarCliente(id);
  return response.status(200).json({ message: "Acesso do cliente reativado." });
}
