// Exporta a classe base de erro da aplicação, estendendo Error nativo do JS.
export class AppError extends Error {
  // Código HTTP associado ao erro (400, 401, 404 etc.).
  public readonly statusCode: number;

  // Construtor recebe status HTTP e mensagem amigável.
  constructor(statusCode: number, message: string) {
    // Chama construtor de Error para definir message e stack.
    super(message);
    // Define nome da classe para facilitar identificação em logs/debug.
    this.name = "AppError";
    // Armazena o status HTTP no objeto de erro.
    this.statusCode = statusCode;
  }
}

// Erro específico para recurso não encontrado; padroniza status 404.
export class RecursoNaoEncontradoError extends AppError {
  // Permite mensagem customizada, com padrão em português.
  constructor(mensagem = "Recurso nǜo encontrado.") {
    // Chama AppError com status 404.
    super(404, mensagem);
    // Ajusta nome para este tipo de erro.
    this.name = "RecursoNaoEncontradoError";
  }
}

// Erro para conflitos de estado/dados, como duplicidade; status 409.
export class ConflitoError extends AppError {
  // Recebe mensagem obrigatória descrevendo o conflito.
  constructor(mensagem: string) {
    // Chama AppError com status 409.
    super(409, mensagem);
    // Define nome da classe.
    this.name = "ConflitoError";
  }
}

// Erro para requisição inválida/regra de negócio violada; status 400.
export class RequisicaoInvalidaError extends AppError {
  // Recebe mensagem obrigatória.
  constructor(mensagem: string) {
    // Chama AppError com status 400.
    super(400, mensagem);
    // Define nome da classe.
    this.name = "RequisicaoInvalidaError";
  }
}

// Erro para ausência/falha de autenticação; status 401.
export class NaoAutorizadoError extends AppError {
  // Mensagem padrão quando autenticação é necessária.
  constructor(mensagem = "Nǜo autorizado.") {
    // Chama AppError com status 401.
    super(401, mensagem);
    // Define nome da classe.
    this.name = "NaoAutorizadoError";
  }
}

// Erro para usuário autenticado sem permissão; status 403.
export class AcessoProibidoError extends AppError {
  // Mensagem padrão de acesso proibido.
  constructor(mensagem = "Acesso proibido.") {
    // Chama AppError com status 403.
    super(403, mensagem);
    // Define nome da classe.
    this.name = "AcessoProibidoError";
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: padronizar erros de domínio com status HTTP.
// - Base: AppError(statusCode,message).
// - Especializações: RecursoNaoEncontradoError(404), ConflitoError(409), RequisicaoInvalidaError(400), NaoAutorizadoError(401), AcessoProibidoError(403).
// - Uso: services/controllers lançam esses erros; errorHandler os serializa.
