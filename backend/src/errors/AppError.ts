export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class RecursoNaoEncontradoError extends AppError {
  constructor(mensagem = "Recurso não encontrado.") {
    super(404, mensagem);
    this.name = "RecursoNaoEncontradoError";
  }
}

export class ConflitoError extends AppError {
  constructor(mensagem: string) {
    super(409, mensagem);
    this.name = "ConflitoError";
  }
}

export class RequisicaoInvalidaError extends AppError {
  constructor(mensagem: string) {
    super(400, mensagem);
    this.name = "RequisicaoInvalidaError";
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(mensagem = "Não autorizado.") {
    super(401, mensagem);
    this.name = "NaoAutorizadoError";
  }
}

export class AcessoProibidoError extends AppError {
  constructor(mensagem = "Acesso proibido.") {
    super(403, mensagem);
    this.name = "AcessoProibidoError";
  }
}
