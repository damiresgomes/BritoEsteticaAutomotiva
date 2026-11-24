// Importa tipos Request/Response do Express para tipar os handlers HTTP.
import { Request, Response } from "express";
// Importa schemas Zod para validar payloads de cadastro de cliente e login.
import { cadastroClienteSchema, loginSchema } from "../schemas/authSchema";
// Importa regras de negócio de autenticação/perfil do service de auth.
import { buscarPerfilConta, cadastrarCliente, loginAuthService } from "../services/authService";
// Importa função que marca jti como revogado (logout) em memória.
import { expirarToken } from "../services/revogacaoService";
// Importa erro padrão para retornar status HTTP semântico.
import { AppError } from "../errors/AppError";
// Importa schemas para atualização de perfil admin e atualização do próprio usuário.
import { atualizacaoUsuarioSchema, perfilAdminSchema } from "../schemas/usuarioSchema";
// Importa services de usuário para atualizar perfil administrativo e perfil próprio.
import {
  atualizarPerfilAdministrador,
  atualizar as atualizarUsuario,
} from "../services/usuarioService";

// POST /auth/login (ou alias): autentica usuário/admin/cliente pelo fluxo genérico.
export async function login(request: Request, response: Response): Promise<Response> {
  // Valida body com Zod; se inválido, ZodError vai para errorHandler (400).
  const dados = loginSchema.parse(request.body);
  // Chama service que verifica credenciais, status da conta e emite JWT.
  const resultado = await loginAuthService(dados);

  // Retorna 200 com token e dados públicos do usuário.
  return response.status(200).json(resultado);
}

// POST /auth/admin/login: autentica somente contas com papel admin.
export async function loginAdmin(
  request: Request,
  response: Response
): Promise<Response> {
  // Valida e normaliza e-mail/senha recebidos no body.
  const dados = loginSchema.parse(request.body);
  // Passa papelEsperado='admin' para o service bloquear login de cliente neste endpoint.
  const resultado = await loginAuthService(dados, "admin");

  // Retorna token JWT e dados do admin autenticado.
  return response.status(200).json(resultado);
}

// POST /auth/cadastro-cliente: cadastro público de cliente.
export async function cadastroCliente(request: Request, response: Response): Promise<Response> {
  // Valida nome, email, senha, cpf e telefone conforme schema.
  const dados = cadastroClienteSchema.parse(request.body);
  // Service aplica hash de senha, verifica duplicidade e cria registros.
  const { id } = await cadastrarCliente(dados);

  // Retorna 201 Created com mensagem e id do cliente criado.
  return response.status(201).json({
    message: "Cadastro realizado com sucesso",
    id,
  });
}

// POST /auth/logout: encerra sessão revogando o jti do token atual.
export async function logout(request: Request, response: Response): Promise<Response> {
  // Obtém dados da sessão anexados pelo authMiddleware.
  const sessao = request.usuario;

  // Sem sessão, o cliente não enviou token válido.
  if (!sessao) {
    throw new AppError(401, "Token nǜo informado");
  }

  // Calcula segundos restantes até expiração natural do JWT.
  const agora = Math.floor(Date.now() / 1000);
  // Usa exp do token, ou 1h padrão; garante mínimo de 1s.
  const segundosRestantes = Math.max((sessao.exp ?? agora + 3600) - agora, 1);
  // Registra jti na lista de revogação em memória até expirar.
  expirarToken(sessao.jti, segundosRestantes);

  // Confirma logout para o frontend limpar token local.
  return response.status(200).json({ message: "Sessǜo encerrada com sucesso" });
}

// GET /auth/me: retorna perfil da conta autenticada.
export async function perfil(request: Request, response: Response): Promise<Response> {
  // Sessão vem do authMiddleware.
  const sessao = request.usuario;

  // Se não houver sessão, retorna 401.
  if (!sessao) {
    throw new AppError(401, "Token nǜo informado");
  }

  // Busca perfil normalizado (conta unificada ou usuário legado).
  const usuario = await buscarPerfilConta(sessao.id, sessao.usuarioId);

  // Retorna dados do perfil para o frontend/contexto de sessão.
  return response.status(200).json(usuario);
}

// PUT /auth/perfil-admin: atualiza perfil do próprio administrador.
export async function atualizarPerfilAdmin(
  request: Request,
  response: Response
): Promise<Response> {
  // Obtém sessão autenticada.
  const sessao = request.usuario;
  // Exige que exista usuarioId vinculado e papel admin.
  if (!sessao?.usuarioId || sessao.papel !== "admin") {
    throw new AppError(403, "Perfil administrativo nǜo encontrado.");
  }

  // Valida campos permitidos para perfil admin.
  const dados = perfilAdminSchema.parse(request.body);
  // Atualiza no service/repository; e-mail não deve ser alterado por esse fluxo.
  await atualizarPerfilAdministrador(sessao.usuarioId, dados);
  // Resposta simples de sucesso.
  return response.status(200).json({ message: "Perfil atualizado com sucesso." });
}

// PUT /auth/perfil-usuario: atualiza o próprio usuário autenticado.
export async function atualizarMeuUsuario(
  request: Request,
  response: Response
): Promise<Response> {
  // Sessão autenticada pelo authMiddleware.
  const sessao = request.usuario;
  // Precisa ter usuarioId para editar cadastro de usuário.
  if (!sessao?.usuarioId) {
    throw new AppError(403, "Usuǭrio nǜo encontrado para edi��ǜo.");
  }

  // Valida dados de atualização do usuário.
  const dados = atualizacaoUsuarioSchema.parse(request.body);
  // Atualiza apenas o próprio usuário.
  await atualizarUsuario(sessao.usuarioId, dados);
  // Retorna confirmação.
  return response.status(200).json({ message: "Perfil atualizado com sucesso." });
}

// GET /auth/teste: endpoint autenticado simples para diagnóstico.
export async function teste(request: Request, response: Response): Promise<Response> {
  // Retorna payload/sessão anexada pelo middleware.
  return response.status(200).json({ usuario: request.usuario });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller de autenticação do backend. Faz a ponte HTTP entre rotas de auth e
// services. Responsabilidades: validar body com Zod, aplicar regra de papel/admin
// quando necessário, iniciar login/cadastro, retornar perfil, revogar token no
// logout e atualizar perfil próprio/admin. Não contém SQL; erros de negócio sobem
// como AppError e validação como ZodError para o errorHandler.
