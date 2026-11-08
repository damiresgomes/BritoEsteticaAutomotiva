import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { tokenExpirado } from "../services/revogacaoService";
import { buscarPorId } from "../repositories/usuarioRepository";

export interface Token {
  id: number;
  email: string;
  jti: string;
  tipo?: "usuario";
  papel?: "admin" | "usuario";
  exp?: number;
  iat?: number;
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: Token;
  }
}

export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "Token não informado");
  }

  let payload: Token;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as Token;
    if (!payload.jti || (payload.tipo && payload.tipo !== "usuario")) throw new Error();
  } catch {
    throw new AppError(401, "Token inválido ou expirado");
  }

  if (tokenExpirado(payload.jti)) {
    throw new AppError(401, "Sessão encerrada. Faça login novamente.");
  }

  const usuario = await buscarPorId(payload.id);

  if (!usuario) {
    throw new AppError(401, "Usuário não encontrado");
  }

  if (usuario.ativo !== "Sim") {
    throw new AppError(403, "Usuário inativo");
  }

  request.usuario = { ...payload, tipo: "usuario", papel: usuario.papel };
  next();
}
