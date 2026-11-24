// Importa tipos do Express para middleware e tipagem de request/response.
import { NextFunction, Request, Response } from "express";
// Importa jsonwebtoken para verificar e decodificar JWT.
import jwt from "jsonwebtoken";
// Importa env com JWT_SECRET validado.
import { env } from "../config/env";
// Importa erro de aplicação para respostas 401/403.
import { AppError } from "../errors/AppError";
// Importa tipos/funções para buscar conta unificada por id/email.
import {
  buscarContaPorEmail,
  buscarContaPorId,
  PapelConta,
} from "../repositories/contaAcessoRepository";
// Importa fallback para tabela usuario legada.
import {
  buscarPorEmail as buscarUsuarioPorEmail,
  buscarPorId,
} from "../repositories/usuarioRepository";
// Importa verificação de revogação de token (logout).
import { tokenExpirado } from "../services/revogacaoService";

// Interface do payload/token anexado à request após autenticação.
export interface Token {
  // ID da conta/usuário conforme token.
  id: number;
  // E-mail autenticado.
  email: string;
  // Papel de acesso: admin ou cliente.
  papel: PapelConta;
  // Identificador único do token para revogação.
  jti: string;
  // Timestamp de expiração JWT (opcional no tipo).
  exp?: number;
  // ID de cliente vinculado, quando houver.
  clienteId?: number | null;
  // ID de usuário vinculado, quando houver.
  usuarioId?: number | null;
}

// Extende a tipagem do Request do Express para incluir usuario autenticado.
declare module "express-serve-static-core" {
  interface Request {
    // Campo preenchido pelo authMiddleware quando token é válido.
    usuario?: Token;
  }
}

// Type guard que valida formato mínimo do payload JWT.
function payloadValido(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & {
  id: number;
  email: string;
  papel?: string;
  tipo?: string;
  jti: string;
} {
  // Garante objeto com id inteiro seguro, email string e jti string não vazia.
  return (
    typeof payload === "object" &&
    payload !== null &&
    Number.isSafeInteger(payload.id) &&
    typeof payload.email === "string" &&
    typeof payload.jti === "string" &&
    payload.jti.length > 0
  );
}

// Middleware que autentica requisições administrativas/gerais via Bearer token.
export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  // Extrai esquema, token e possíveis partes extras do header Authorization.
  const [esquema, token, ...extra] = request.headers.authorization?.trim().split(/\s+/) ?? [];

  // Exige "Bearer <token>" sem partes extras.
  if (esquema?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
    throw new AppError(401, "Token nǜo informado");
  }

  // Variável que receberá payload validado.
  let payload: jwt.JwtPayload & {
    id: number;
    email: string;
    papel?: string;
    tipo?: string;
    jti: string;
  };
  try {
    // Verifica assinatura, algoritmo e expiração do JWT.
    const verificado = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    // Confirma que payload possui campos mínimos esperados.
    if (!payloadValido(verificado)) {
      throw new Error("Payload invǭlido");
    }
    // Atribui payload tipado.
    payload = verificado;
  } catch {
    // Qualquer falha de verificação vira 401.
    throw new AppError(401, "Token invǭlido ou expirado");
  }

  // Bloqueia tokens revogados por logout.
  if (tokenExpirado(payload.jti)) {
    throw new AppError(401, "Sessǜo encerrada. Fa��a login novamente.");
  }

  // Para tokens não marcados como tipo usuario, tenta localizar conta unificada por id ou email.
  const conta =
    payload.tipo === "usuario"
      ? null
      : (await buscarContaPorId(payload.id)) ?? (await buscarContaPorEmail(payload.email));

  // Se encontrou conta válida correspondente ao email do token.
  if (conta && conta.email === payload.email) {
    // Conta inativa ou usuário vinculado inativo não pode acessar.
    if (conta.ativo !== "Sim" || conta.usuarioAtivo === "Não") {
      throw new AppError(403, "Conta inativa");
    }
    // Anexa dados normalizados do usuário autenticado na request.
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
    // Fallback: busca usuário na tabela legada por id ou email.
    const usuario =
      (await buscarPorId(payload.id)) ?? (await buscarUsuarioPorEmail(payload.email));
    // Se não encontrar ou email não bater, sessão é inválida.
    if (!usuario || usuario.email !== payload.email) {
      throw new AppError(401, "Sessǜo invǭlida. Fa��a login novamente.");
    }
    // Usuário inativo não acessa.
    if (!usuario.ativo) {
      throw new AppError(403, "Conta inativa");
    }
    // Normaliza papel vindo do legado para admin/cliente.
    request.usuario = {
      id: usuario.id,
      email: usuario.email,
      papel: String(usuario.papel).toLowerCase() === "admin" ? "admin" : "cliente",
      jti: payload.jti,
      exp: payload.exp,
      usuarioId: usuario.id,
      clienteId: null,
    };
  }

  // Autenticação OK; segue para próximo middleware/controller.
  next();
}

// Factory de middleware que exige papel específico após authMiddleware.
export function exigirPapel(papel: PapelConta) {
  // Retorna middleware Express configurado para o papel requerido.
  return (request: Request, _response: Response, next: NextFunction): void => {
    // Sem usuario na request, authMiddleware não rodou ou falhou.
    if (!request.usuario) {
      throw new AppError(401, "Token nǜo informado");
    }

    // Se papel não corresponde, nega acesso com 403.
    if (request.usuario.papel !== papel) {
      throw new AppError(403, "VocǦ nǜo tem permissǜo para acessar este recurso");
    }

    // Papel autorizado; continua.
    next();
  };
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: autenticação JWT para rotas admin/gerais e autorização por papel.
// - Fluxo: extrai Bearer token -> verifica JWT HS256 -> valida payload mínimo -> checa revogação por jti -> carrega conta em `contas_acesso` ou fallback `usuario` -> valida ativo/email -> anexa `request.usuario`.
// - Segurança: rejeita token ausente/inválido/expirado/revogado; bloqueia conta inativa (403).
// - Autorização: `exigirPapel` garante que apenas o papel esperado acesse a rota.
