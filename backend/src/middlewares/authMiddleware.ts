import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { UsuarioRepository } from "../repositories/usuarioRepository";
import { tokenRevogado } from "../services/revogacaoService";

export interface TokenPayload {
  id: number;
  email: string;
  jti: string;
  exp?: number;
  iat?: number;
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: TokenPayload;
  }
}

const usuarioRepository = new UsuarioRepository();

export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  const cabecalho = request.headers.authorization;

  if (!cabecalho?.startsWith("Bearer ")) {
    throw new AppError(401, "Token não informado");
  }

  const token = cabecalho.slice("Bearer ".length);

  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload;
  } catch {
    throw new AppError(401, "Token inválido ou expirado");
  }

  if (!payload.jti) {
    throw new AppError(401, "Token inválido ou expirado");
  }

  if (tokenRevogado(payload.jti)) {
    throw new AppError(401, "Sessão encerrada. Faça login novamente.");
  }

  const usuario = await usuarioRepository.buscarPorId(payload.id);

  if (!usuario) {
    throw new AppError(401, "Usuário não encontrado");
  }

  if (usuario.ativo !== "Sim") {
    throw new AppError(403, "Usuário inativo");
  }

  request.usuario = payload;
  next();
}
