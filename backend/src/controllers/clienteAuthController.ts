import { Request, Response } from "express";
import { loginSchema } from "../schemas/authSchema";
import { atualizarClienteSchema, cadastroClienteSchema } from "../schemas/clienteSchema";
import { atualizarMeuCadastroCliente, cadastrarCliente, buscarPerfilCliente } from "../services/clienteService";
import { loginClienteAuthService } from "../services/clienteAuthService";
import { expirarToken } from "../services/revogacaoService";
import { AppError } from "../errors/AppError";

export async function cadastrarClienteController(request: Request, response: Response): Promise<Response> {
  const dados = cadastroClienteSchema.parse(request.body);
  const { id } = await cadastrarCliente(dados);
  return response.status(201).json({ message: "Cadastro realizado com sucesso.", id });
}

export async function loginClienteController(request: Request, response: Response): Promise<Response> {
  const dados = loginSchema.parse(request.body);
  const { token } = await loginClienteAuthService(dados);
  return response.status(200).json({ token });
}

export async function logoutClienteController(request: Request, response: Response): Promise<Response> {
  const sessao = request.cliente;
  if (!sessao) throw new AppError(401, "Token não informado.");
  expirarToken(sessao.jti, sessao.exp ?? 3600);
  return response.status(200).json({ message: "Sessão encerrada com sucesso." });
}

export async function perfilClienteController(request: Request, response: Response): Promise<Response> {
  const sessao = request.cliente;
  if (!sessao) throw new AppError(401, "Token não informado.");
  return response.status(200).json(await buscarPerfilCliente(sessao.id));
}

export async function atualizarMeuCadastroClienteController(request: Request, response: Response): Promise<Response> {
  const sessao = request.cliente;
  if (!sessao) throw new AppError(401, "Autenticação de cliente necessária.");

  const dados = atualizarClienteSchema.parse(request.body);
  await atualizarMeuCadastroCliente(sessao.id, dados);

  return response.status(200).json({ message: "Cadastro atualizado com sucesso." });
}
