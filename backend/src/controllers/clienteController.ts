import { Request, Response } from "express";
import { atualizarClienteUsuarioSchema, cadastroClienteSchema } from "../schemas/clienteSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  buscarClientePorId,
  cadastrarCliente,
  clienteAtualizar,
  excluirCliente,
  listarClientes,
} from "../services/clienteService";

export async function cadastrarClienteController(request: Request, response: Response): Promise<Response> {
  const dados = cadastroClienteSchema.parse(request.body);
  const { id } = await cadastrarCliente(dados);

  return response.status(201).json({
    message: "Cliente cadastrado com sucesso",
    id,
  });
}

export async function listarClientesController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { clientes, total } = await listarClientes(pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(clientes, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function buscarClientePorIdController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "cliente");
  const cliente = await buscarClientePorId(id);
  return response.status(200).json(cliente);
}

export async function atualizarClienteController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "cliente");
  const dados = atualizarClienteUsuarioSchema.parse(request.body);
  await clienteAtualizar(id, dados);

  return response.status(200).json({ message: "Cliente atualizado com sucesso" });
}

export async function desativarClienteController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "cliente");
  await excluirCliente(id);

  return response.status(200).json({ message: "Cliente desativado com sucesso" });
}
