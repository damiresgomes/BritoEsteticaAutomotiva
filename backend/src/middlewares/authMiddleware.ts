import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { buscarContaPorId, PapelConta } from "../repositories/contaAcessoRepository";
import { buscarPorId } from "../repositories/usuarioRepository";
import { tokenExpirado } from "../services/revogacaoService";

export interface Token {
  id: number;
  email: string;
  papel: PapelConta;
  jti: string;
  exp?: number;
  clienteId?: number | null;
  usuarioId?: number | null;
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: Token;
  }
}

function payloadValido(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & {
  id: number;
  email: string;
  papel?: string;
  tipo?: string;
  jti: string;
} {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Number.isSafeInteger(payload.id) &&
    typeof payload.email === "string" &&
    typeof payload.jti === "string" &&
    payload.jti.length > 0
  );
}

export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  const [esquema, token, ...extra] = request.headers.authorization?.trim().split(/\s+/) ?? [];

  if (esquema?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
    throw new AppError(401, "Token não informado");
  }

  let payload: jwt.JwtPayload & {
    id: number;
    email: string;
    papel?: string;
    tipo?: string;
    jti: string;
  };
  try {
    const verificado = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!payloadValido(verificado)) {
      throw new Error("Payload inválido");
    }
    payload = verificado;
  } catch {
    throw new AppError(401, "Token inválido ou expirado");
  }

  if (tokenExpirado(payload.jti)) {
    throw new AppError(401, "Sessão encerrada. Faça login novamente.");
  }

  const conta = await buscarContaPorId(payload.id);

  if (conta) {
    if (conta.email !== payload.email) {
      throw new AppError(401, "Sessão inválida. Faça login novamente.");
    }
    if (conta.ativo !== "Sim" || conta.usuarioAtivo === "Não") {
      throw new AppError(403, "Conta inativa");
    }
    request.usuario = {
      id: conta.id,
      email: conta.email,
      papel: conta.papel,
      jti: payload.jti,
      exp: payload.exp,
      clienteId: conta.clienteId,
      usuarioId: conta.usuarioId,
    };
  } else {
    const usuario = await buscarPorId(payload.id);
    if (!usuario || usuario.email !== payload.email) {
      throw new AppError(401, "Sessão inválida. Faça login novamente.");
    }
    if (!usuario.ativo) {
      throw new AppError(403, "Conta inativa");
    }
    request.usuario = {
      id: usuario.id,
      email: usuario.email,
      papel: usuario.papel === "admin" ? "admin" : "cliente",
      jti: payload.jti,
      exp: payload.exp,
      usuarioId: usuario.id,
      clienteId: null,
    };
  }

  next();
}

export function exigirPapel(papel: PapelConta) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.usuario) {
      throw new AppError(401, "Token não informado");
    }

    if (request.usuario.papel !== papel) {
      throw new AppError(403, "Você não tem permissão para acessar este recurso");
    }

    next();
  };
}
