import { Request, Response } from "express";
import { loginSchema } from "../schemas/authSchema";
import { loginAuthService, buscarUsuarioPorId } from "../services/authService";
import { expirarToken } from "../services/revogacaoService";
import { AppError } from "../errors/AppError";

export async function login(request: Request, response: Response): Promise<Response> {
  const dados = loginSchema.parse(request.body);
  const { token } = await loginAuthService(dados);

  return response.status(200).json({ token });
}

export async function logout(request: Request, response: Response): Promise<Response> {
  
  const sessao = request.usuario;

  if (!sessao) {
    throw new AppError(401, "Token não informado");
  }

  expirarToken(sessao.jti, sessao.exp ?? 3600);

  return response.status(200).json({ message: "Sessão encerrada com sucesso" });
}

export async function perfil(request: Request, response: Response): Promise<Response> {
  const sessao = request.usuario;

  if (!sessao) {
    throw new AppError(401, "Token não informado");
  }

  const usuario = await buscarUsuarioPorId(sessao.id);

  return response.status(200).json(usuario);
}