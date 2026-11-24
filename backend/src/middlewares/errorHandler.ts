// Importa tipos do Express para middleware de erro.
import { NextFunction, Request, Response } from "express";
// Importa ZodError para identificar erros de validação de schema.
import { ZodError } from "zod";
// Importa AppError para tratar erros de domínio com status conhecido.
import { AppError } from "../errors/AppError";

// Mapeia códigos de erro MySQL para status HTTP e mensagem segura ao usuário.
const ERROS_MYSQL: Record<string, { status: number; message: string }> = {
  // Entrada duplicada (unique/email/cpf).
  ER_DUP_ENTRY: { status: 409, message: "Registro duplicado: e-mail ou CPF jǭ cadastrado" },
  // FK aponta para registro inexistente.
  ER_NO_REFERENCED_ROW_2: { status: 400, message: "ReferǦncia invǭlida: registro relacionado nǜo existe" },
  // Tentativa de excluir registro referenciado por outra tabela.
  ER_ROW_IS_REFERENCED_2: { status: 409, message: "Nǜo Ǹ poss��vel excluir o registro pois ele possui v��nculos ativos." },
  // Banco recusou conexão.
  ECONNREFUSED: { status: 503, message: "Banco de dados indispon��vel" },
  // Conexão com banco foi perdida.
  PROTOCOL_CONNECTION_LOST: { status: 503, message: "Banco de dados indispon��vel" },
  // Timeout ao conectar/consultar banco.
  ETIMEDOUT: { status: 503, message: "Banco de dados indispon��vel" },
};

// Middleware global de erros do Express (4 parâmetros).
export function errorHandler(
  // Erro capturado por throw/next(err).
  error: unknown,
  // Requisição original (não usada aqui).
  _request: Request,
  // Resposta HTTP onde o erro será enviado.
  response: Response,
  // next é usado para delegar se headers já foram enviados.
  next: NextFunction
): Response | void {
  // Se a resposta já começou a ser enviada, delega ao handler padrão do Express.
  if (response.headersSent) {
    return next(error);
  }

  // Se for erro de validação Zod, retorna 400 com detalhes por campo.
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Erro de valida��ǜo",
      // Mapeia issues do Zod para formato simples campo/mensagem.
      erros: error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  // Se for erro de aplicação conhecido, usa seu status e mensagem.
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  // Se for erro de sintaxe JSON no body, retorna 400.
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ message: "JSON invǭlido" });
  }

  // Extrai código/sqlMessage de erros de driver MySQL.
  const codigoErro = (error as { code?: string; sqlMessage?: string })?.code;
  // SIGNAL SQLSTATE customizado vira 400 com mensagem genérica de integridade.
  if (codigoErro === "ER_SIGNAL_EXCEPTION") {
    return response.status(400).json({
      message: "Opera�������oo inv��lida: dados violam regra de integridade",
    });
  }
  // Se o código MySQL estiver mapeado, retorna status/mensagem seguros.
  if (codigoErro && ERROS_MYSQL[codigoErro]) {
    const { status, message } = ERROS_MYSQL[codigoErro];
    return response.status(status).json({ message });
  }

  // Erro desconhecido: loga no servidor para diagnóstico interno.
  console.error("Erro nǜo tratado:", error);
  // Retorna 500 genérico para não vazar detalhes internos ao cliente.
  return response.status(500).json({ message: "Erro interno do servidor" });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: tradutor central de exceções para HTTP.
// - Mapeia: ZodError->400 com campos; AppError->status/message; SyntaxError body->400 JSON inválido; códigos MySQL comuns->409/400/503; ER_SIGNAL_EXCEPTION->400.
// - Segurança: não vaza detalhes internos; erros desconhecidos viram 500 genérico e são logados no servidor.
