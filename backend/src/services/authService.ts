import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  buscarContaPorEmail,
  buscarContaPorId,
  criarClienteComConta,
  emailEmUso,
} from "../repositories/contaAcessoRepository";
import { buscarPorEmail as buscarUsuarioPorEmail, buscarPorId as buscarUsuarioRepoPorId } from "../repositories/usuarioRepository";
import { CadastroClienteInput, LoginInput } from "../schemas/authSchema";
import { StatusAtivo } from "../entities/usuario";

const HASH_FICTICIO = bcrypt.hashSync("senha-fantasia", 10);

function hashBcryptCompativel(hash: string): string {
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

function erroDeDuplicidade(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "ER_DUP_ENTRY"
  );
}

export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
  if (await emailEmUso(dados.email)) {
    throw new AppError(409, "E-mail já cadastrado");
  }
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  try {
    const { clienteId } = await criarClienteComConta({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      telefone: dados.telefone,
      cpf: dados.cpf,
    });

    return { id: clienteId };
  } catch (erro) {
    if (erroDeDuplicidade(erro)) {
      throw new AppError(409, "E-mail ou CPF já cadastrado");
    }

    throw erro;
  }
}

export async function loginAuthService(
  { email, senha }: LoginInput,
  papelEsperado?: "cliente" | "admin"
): Promise<{
  token: string;
  usuario: { id: number; nome: string; email: string; papel: "cliente" | "admin" };
}> {
  const conta = await buscarContaPorEmail(email);

  if (conta) {
    const senhaOk = await bcrypt.compare(senha, hashBcryptCompativel(conta.senhaHash));
    if (!senhaOk) {
      throw new AppError(401, "E-mail ou senha inválidos");
    }

    if (conta.ativo !== "Sim" || conta.usuarioAtivo === "Não") {
      throw new AppError(403, "Conta inativa");
    }

    if (papelEsperado && conta.papel !== papelEsperado) {
      throw new AppError(
        403,
        papelEsperado === "admin"
          ? "Acesso restrito a contas administrativas"
          : "Acesso restrito a contas de cliente"
      );
    }

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

  // Fallback para login direto na tabela usuario
  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) {
    await bcrypt.compare(senha, HASH_FICTICIO);
    throw new AppError(401, "E-mail ou senha inválidos");
  }

  const senhaOk = await bcrypt.compare(senha, hashBcryptCompativel(usuario.senhaHash));
  if (!senhaOk) {
    throw new AppError(401, "E-mail ou senha inválidos");
  }

  if (!usuario.ativo) {
    throw new AppError(403, "Conta inativa");
  }

  const papelConta: "cliente" | "admin" = usuario.papel === "admin" ? "admin" : "cliente";

  if (papelEsperado && papelConta !== papelEsperado) {
    throw new AppError(
      403,
      papelEsperado === "admin"
        ? "Acesso restrito a contas administrativas"
        : "Acesso restrito a contas de cliente"
    );
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo: "usuario",
      papel: usuario.papel,
      jti: randomUUID(),
    },
    env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

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

export async function buscarPerfilConta(id: number): Promise<{
  id: number;
  usuarioId: number | null;
  nome: string;
  email: string;
  cpf: string | null;
  papel: "cliente" | "admin";
  salario: number | null;
  datanascimento: string | null;
}> {
  const conta = await buscarContaPorId(id);

  if (conta) {
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

  const usuario = await buscarUsuarioRepoPorId(id);
  if (!usuario) {
    throw new AppError(404, "Conta não encontrada");
  }

  return {
    id: usuario.id,
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    papel: usuario.papel === "admin" ? "admin" : "cliente",
    salario: usuario.salario,
    datanascimento: usuario.dataDeNascimento,
  };
}

export async function buscarUsuarioPorId(id: number): Promise<{
  id: number;
  nome: string;
  email: string;
  ativo: StatusAtivo;
  papel: "admin" | "usuario";
}> {
  const usuario = await buscarUsuarioRepoPorId(id);
  if (!usuario) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo ? StatusAtivo.SIM : StatusAtivo.NAO,
    papel: usuario.papel,
  };
}
