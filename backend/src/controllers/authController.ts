import { Request, Response } from "express";
import { cadastroClienteSchema, loginSchema } from "../schemas/authSchema";
import { buscarPerfilConta, cadastrarCliente, loginAuthService } from "../services/authService";
import { expirarToken } from "../services/revogacaoService";
import { AppError } from "../errors/AppError";

export async function login(request: Request, response: Response): Promise<Response> {
  const dados = loginSchema.parse(request.body);
  const resultado = await loginAuthService(dados);

  return response.status(200).json(resultado);
}

export async function cadastroCliente(request: Request, response: Response): Promise<Response> {
  const dados = cadastroClienteSchema.parse(request.body);
  const { id } = await cadastrarCliente(dados);

  return response.status(201).json({
    message: "Cadastro realizado com sucesso",
    id,
  });
}

export async function logout(request: Request, response: Response): Promise<Response> {
  
  const sessao = request.usuario;

  if (!sessao) {
    throw new AppError(401, "Token não informado");
  }

  const agora = Math.floor(Date.now() / 1000);
  const segundosRestantes = Math.max((sessao.exp ?? agora + 3600) - agora, 1);
  expirarToken(sessao.jti, segundosRestantes);

  return response.status(200).json({ message: "Sessão encerrada com sucesso" });
}

export async function perfil(request: Request, response: Response): Promise<Response> {
  const sessao = request.usuario;

  if (!sessao) {
    throw new AppError(401, "Token não informado");
  }

  const usuario = await buscarPerfilConta(sessao.id);

  return response.status(200).json(usuario);
}

export async function teste(request: Request, response: Response): Promise<Response> {
  return response.status(200).json({ usuario: request.usuario });
}