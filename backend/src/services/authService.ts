// Importa bcrypt para comparar e gerar hashes de senha.
import bcrypt from "bcrypt";
// Importa jsonwebtoken para emitir tokens JWT.
import jwt from "jsonwebtoken";
// Importa randomUUID para gerar jti único por token.
import { randomUUID } from "node:crypto";
// Importa configuração validada de ambiente (JWT_SECRET etc.).
import { env } from "../config/env";
// Importa erros de aplicação para status HTTP semânticos.
import { AppError, RecursoNaoEncontradoError } from "../errors/AppError";
// Funções de acesso à tabela/visão de contas unificadas.
import {
  buscarContaPorEmail,
  buscarContaPorId,
  criarClienteComConta,
  emailEmUso,
} from "../repositories/contaAcessoRepository";
// Fallback para tabela legada de usuários.
import { buscarPorEmail as buscarUsuarioPorEmail, buscarPorId as buscarUsuarioRepoPorId } from "../repositories/usuarioRepository";
// Tipos de entrada validados pelos schemas Zod.
import { CadastroClienteInput, LoginInput } from "../schemas/authSchema";
// Enum de status ativo usado na resposta legada de usuário.
import { StatusAtivo } from "../entities/usuario";

// Hash fictício usado para equalizar tempo de resposta quando e-mail não existe.
const HASH_FICTICIO = bcrypt.hashSync("senha-fantasia", 10);

// Converte hash bcrypt no formato $2y$ (PHP) para $2b$ aceito pelo bcrypt do Node.
function hashBcryptCompativel(hash: string): string {
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

// Detecta erro de chave duplicada do MySQL.
function erroDeDuplicidade(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "ER_DUP_ENTRY"
  );
}

// Cadastra cliente com conta de acesso; usado por fluxo público de cadastro.
export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
  // Verifica duplicidade de e-mail antes de criar.
  if (await emailEmUso(dados.email)) {
    throw new AppError(409, "E-mail jǭ cadastrado");
  }
  // Gera hash seguro da senha; nunca salva senha em texto puro.
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  try {
    // Cria cliente e conta de acesso no repositório (transação/SQL conforme implementação).
    const { clienteId } = await criarClienteComConta({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      telefone: dados.telefone,
      cpf: dados.cpf,
    });

    // Retorna id do cliente criado.
    return { id: clienteId };
  } catch (erro) {
    // Se banco acusar duplicidade, retorna conflito amigável.
    if (erroDeDuplicidade(erro)) {
      throw new AppError(409, "E-mail ou CPF jǭ cadastrado");
    }

    // Repassa erros desconhecidos para o errorHandler.
    throw erro;
  }
}

// Realiza login para admin ou cliente, conforme papelEsperado.
export async function loginAuthService(
  { email, senha }: LoginInput,
  papelEsperado?: "cliente" | "admin"
): Promise<{
  token: string;
  usuario: { id: number; nome: string; email: string; papel: "cliente" | "admin" };
}> {
  // Primeiro tenta autenticar pela conta unificada.
  const conta = await buscarContaPorEmail(email);

  if (conta) {
    // Compara senha informada com hash armazenado (com compatibilidade $2y$).
    const senhaOk = await bcrypt.compare(senha, hashBcryptCompativel(conta.senhaHash));
    if (!senhaOk) {
      throw new AppError(401, "E-mail ou senha invǭlidos");
    }

    // Bloqueia contas inativas.
    if (conta.ativo !== "Sim" || conta.usuarioAtivo === "Não") {
      throw new AppError(403, "Conta inativa");
    }

    // Se endpoint exige papel específico, valida autorização.
    if (papelEsperado && conta.papel !== papelEsperado) {
      throw new AppError(
        403,
        papelEsperado === "admin"
          ? "Acesso restrito a contas administrativas"
          : "Acesso restrito a contas de cliente"
      );
    }

    // Emite JWT com dados mínimos e jti para revogação.
    const token = jwt.sign(
      {
        id: conta.id,
        email: conta.email,
        papel: conta.papel,
        jti: randomUUID(),
      },
      env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    // Retorna token e dados públicos do usuário.
    return {
      token,
      usuario: {
        id: conta.id,
        nome: conta.nome,
        email: conta.email,
        papel: conta.papel,
      },
    };
  }
  // Fallback: busca na tabela legada de usuarios.
  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) {
    // Compara com hash fictício para reduzir diferença de tempo entre e-mail existente/inexistente.
    await bcrypt.compare(senha, HASH_FICTICIO);
    throw new AppError(401, "E-mail ou senha invǭlidos");
  }

  // Valida senha do usuário legado.
  const senhaOk = await bcrypt.compare(senha, hashBcryptCompativel(usuario.senhaHash));
  if (!senhaOk) {
    throw new AppError(401, "E-mail ou senha invǭlidos");
  }

  // Bloqueia usuário inativo.
  if (!usuario.ativo) {
    throw new AppError(403, "Conta inativa");
  }

  // Normaliza papel legado para cliente/admin.
  const papelConta: "cliente" | "admin" = String(usuario.papel).toLowerCase() === "admin" ? "admin" : "cliente";

  // Valida papel esperado pelo endpoint.
  if (papelEsperado && papelConta !== papelEsperado) {
    throw new AppError(
      403,
      papelEsperado === "admin"
        ? "Acesso restrito a contas administrativas"
        : "Acesso restrito a contas de cliente"
    );
  }

  // Emite token compatível com fallback legado.
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo: "usuario",
      papel: papelConta,
      jti: randomUUID(),
    },
    env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  // Retorna dados normalizados.
  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: papelConta,
    },
  };
}

// Busca perfil da conta autenticada para endpoint /me.
export async function buscarPerfilConta(
  id: number,
  usuarioId?: number | null
): Promise<{
  id: number;
  usuarioId: number | null;
  nome: string;
  email: string;
  cpf: string | null;
  papel: "cliente" | "admin";
  salario: number | null;
  datanascimento: string | null;
}> {
  // Se token veio de usuário legado, prioriza busca por usuarioId.
  if (usuarioId) {
    const usuarioDaSessao = await buscarUsuarioRepoPorId(usuarioId);
    if (!usuarioDaSessao) {
      throw new AppError(404, "Conta nǜo encontrada");
    }

    // Retorna perfil no formato esperado pelo frontend.
    return {
      id: usuarioDaSessao.id,
      usuarioId: usuarioDaSessao.id,
      nome: usuarioDaSessao.nome,
      email: usuarioDaSessao.email,
      cpf: usuarioDaSessao.cpf,
      papel: String(usuarioDaSessao.papel).toLowerCase() === "admin" ? "admin" : "cliente",
      salario: usuarioDaSessao.salario,
      datanascimento: usuarioDaSessao.dataDeNascimento,
    };
  }

  // Busca conta unificada por id.
  const conta = await buscarContaPorId(id);

  if (conta) {
    // Mapeia campos da conta para o contrato de perfil.
    return {
      id: conta.id,
      usuarioId: conta.usuarioId,
      nome: conta.nome,
      email: conta.email,
      cpf: conta.usuarioCpf,
      papel: conta.papel,
      salario: conta.usuarioSalario,
      datanascimento: conta.usuarioDataNascimento,
    };
  }

  // Último fallback: usuário legado pelo id.
  const usuario = await buscarUsuarioRepoPorId(id);
  if (!usuario) {
    throw new AppError(404, "Conta nǜo encontrada");
  }

  return {
    id: usuario.id,
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    papel: String(usuario.papel).toLowerCase() === "admin" ? "admin" : "cliente",
    salario: usuario.salario,
    datanascimento: usuario.dataDeNascimento,
  };
}

// Busca usuário por ID para fluxos administrativos que esperam formato legado.
export async function buscarUsuarioPorId(id: number): Promise<{
  id: number;
  nome: string;
  email: string;
  ativo: StatusAtivo;
  papel: "admin" | "usuario";
}> {
  // Consulta repositório de usuário.
  const usuario = await buscarUsuarioRepoPorId(id);
  if (!usuario) {
    // Erro semântico 404.
    throw new RecursoNaoEncontradoError("Usuǭrio nǜo encontrado");
  }

  // Converte boolean/enum para contrato antigo.
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo ? StatusAtivo.SIM : StatusAtivo.NAO,
    papel: usuario.papel,
  };
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: regras de autenticação/cadastro/perfil para contas.
// - Cadastro: verifica e-mail em uso, hash bcrypt, cria cliente+conta; trata duplicidade.
// - Login: busca conta unificada ou fallback usuario; compara bcrypt (compatível com $2y$); valida ativo e papel esperado; emite JWT com jti/expiração.
// - Perfil: resolve por conta unificada ou usuário legado, normalizando formato para o frontend.
// - Segurança: usa hash fictício quando e-mail não existe para reduzir timing side-channel.
