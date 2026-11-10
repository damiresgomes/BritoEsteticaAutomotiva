import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

const ERROS_MYSQL: Record<string, { status: number; message: string }> = {
  ER_DUP_ENTRY: { status: 409, message: "Registro duplicado: e-mail ou CPF já cadastrado" },
  ER_NO_REFERENCED_ROW_2: { status: 400, message: "Referência inválida: registro relacionado não existe" },
  ER_ROW_IS_REFERENCED_2: { status: 409, message: "Não é possível excluir o registro pois ele possui vínculos ativos." },
  ECONNREFUSED: { status: 503, message: "Banco de dados indisponível" },
  PROTOCOL_CONNECTION_LOST: { status: 503, message: "Banco de dados indisponível" },
  ETIMEDOUT: { status: 503, message: "Banco de dados indisponível" },
};

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

  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ message: "JSON inválido" });
  }

  const codigoErro = (error as { code?: string; sqlMessage?: string })?.code;
  // MySQL SIGNAL disparado por triggers (ER_SIGNAL_EXCEPTION = código 1644)
  if (codigoErro === "ER_SIGNAL_EXCEPTION") {
    const sqlMessage = (error as { sqlMessage?: string }).sqlMessage;
    return response.status(400).json({
      message: sqlMessage ?? "Operação inválida: dados violam regra de integridade",
    });
  }
  if (codigoErro && ERROS_MYSQL[codigoErro]) {
    const { status, message } = ERROS_MYSQL[codigoErro];
    return response.status(status).json({ message });
  }

  if (error instanceof Error) {
    return response.status(400).json({ message: error.message });
  }

  console.error("Erro não tratado:", error);
  return response.status(500).json({ message: "Erro interno do servidor" });
}
