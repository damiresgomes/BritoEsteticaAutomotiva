import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

interface ErroDeHttp {
  type?: string;
  status?: number;
  statusCode?: number;
}

const CODIGOS_DE_CONEXAO = [
  "ECONNREFUSED",
  "PROTOCOL_CONNECTION_LOST",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ER_CON_COUNT_ERROR",
];

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): Response | void {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Erro de validação",
      erros: error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  const erroDeHttp = error as ErroDeHttp | null;
  const erroDeBanco = error as ErroDeBanco | null;

  if (
    erroDeHttp?.type === "entity.parse.failed" ||
    erroDeHttp?.status === 400 ||
    erroDeHttp?.statusCode === 400
  ) {
    return response.status(400).json({ message: "JSON inválido" });
  }

  if (erroDeBanco?.code === "ER_DUP_ENTRY" || erroDeBanco?.errno === 1062) {
    return response.status(409).json({
      message: "Registro duplicado: e-mail ou CPF já cadastrado",
    });
  }

  if (erroDeBanco?.code === "ER_NO_REFERENCED_ROW_2" || erroDeBanco?.errno === 1452) {
    return response.status(400).json({
      message: "Referência inválida: a categoria informada não existe",
    });
  }

  if (erroDeBanco?.code && CODIGOS_DE_CONEXAO.includes(erroDeBanco.code)) {
    console.error("Erro de conexão com o banco:", error);
    return response.status(503).json({ message: "Banco de dados indisponível" });
  }

  console.error(error);
  return response.status(500).json({ message: "Erro interno do servidor" });
}
