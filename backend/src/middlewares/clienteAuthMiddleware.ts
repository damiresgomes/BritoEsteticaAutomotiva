// Importa tipos do Express para middleware assíncrono.
import { NextFunction, Request, Response } from "express";
// Importa JWT para verificar token de cliente.
import jwt from "jsonwebtoken";
// Importa segredo JWT validado.
import { env } from "../config/env";
// Importa erro padrão da aplicação.
import { AppError } from "../errors/AppError";
// Busca dados da conta cliente para confirmar existência/ativo.
import { buscarContaClientePorId } from "../repositories/clienteRepository";
// Verifica se token foi revogado no logout.
import { tokenExpirado } from "../services/revogacaoService";

// Payload esperado no token de cliente.
export interface ClienteToken {
  // ID do cliente.
  id: number;
  // E-mail do cliente.
  email: string;
  // Tipo fixo para diferenciar de token admin/usuario.
  tipo: "cliente";
  // ID único do token para revogação.
  jti: string;
  // Expiração padrão JWT.
  exp?: number;
  // Data de emissão padrão JWT.
  iat?: number;
}

// Adiciona campo cliente ao Request do Express.
declare module "express-serve-static-core" {
  interface Request {
    // Preenchido quando cliente está autenticado.
    cliente?: ClienteToken;
  }
}

// Middleware que protege rotas exclusivas de cliente.
export async function clienteAuthMiddleware(request: Request, _response: Response, next: NextFunction): Promise<void> {
  // Lê Authorization no formato "Bearer <token>".
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  // Sem Bearer/token, bloqueia com 401.
  if (scheme !== "Bearer" || !token) throw new AppError(401, "Token nǜo informado.");

  // Variável para payload verificado.
  let payload: ClienteToken;
  try {
    // Verifica assinatura/expiração do JWT.
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as ClienteToken;
    // Garante que é token de cliente com jti e id inteiro.
    if (payload.tipo !== "cliente" || !payload.jti || !Number.isInteger(payload.id)) throw new Error();
  } catch {
    // Token inválido, expirado ou com formato inesperado.
    throw new AppError(401, "Token invǭlido ou expirado.");
  }

  // Rejeita token que foi explicitamente revogado.
  if (tokenExpirado(payload.jti)) throw new AppError(401, "Sessǜo encerrada. Fa��a login novamente.");

  // Confirma que cliente ainda existe no banco.
  const cliente = await buscarContaClientePorId(payload.id);
  if (!cliente) throw new AppError(401, "Cliente nǜo encontrado.");
  // Cliente inativo não pode acessar.
  if (!cliente.ativo) throw new AppError(403, "Cliente inativo.");

  // Anexa payload do cliente na request para controllers/services.
  request.cliente = payload;
  // Continua para a rota protegida.
  next();
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: autenticação exclusiva de cliente.
// - Contrato do token: `tipo: 'cliente'`, `id` inteiro, `jti`.
// - Fluxo: verifica JWT -> valida tipo/jti -> confere revogação -> confirma cliente existente e ativo no banco -> anexa `request.cliente`.
// - Erros: 401 para token inválido/ausente/revogado/inexistente; 403 para cliente inativo.
