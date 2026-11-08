import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { buscarContaClientePorId } from "../repositories/clienteRepository";
import { tokenExpirado } from "../services/revogacaoService";

export interface ClienteToken {
  id: number;
  email: string;
  tipo: "cliente";
  jti: string;
  exp?: number;
  iat?: number;
}

declare module "express-serve-static-core" {
  interface Request {
    cliente?: ClienteToken;
  }
}

export async function clienteAuthMiddleware(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) throw new AppError(401, "Token não informado.");

  let payload: ClienteToken;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as ClienteToken;
    if (payload.tipo !== "cliente" || !payload.jti || !Number.isInteger(payload.id)) throw new Error();
  } catch {
    throw new AppError(401, "Token inválido ou expirado.");
  }

  if (tokenExpirado(payload.jti)) throw new AppError(401, "Sessão encerrada. Faça login novamente.");

  const cliente = await buscarContaClientePorId(payload.id);
  if (!cliente) throw new AppError(401, "Cliente não encontrado.");
  if (cliente.ativo !== "Sim") throw new AppError(403, "Cliente inativo.");

  request.cliente = payload;
  next();
}
