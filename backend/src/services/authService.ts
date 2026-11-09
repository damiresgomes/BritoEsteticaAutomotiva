import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import {
  buscarContaPorEmail,
  buscarContaPorId,
  criarClienteComConta,
  emailEmUso,
} from "../repositories/contaAcessoRepository";
import { CadastroClienteInput, LoginInput } from "../schemas/authSchema";

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

  if (!conta) {
    await bcrypt.compare(senha, HASH_FICTICIO);
    throw new AppError(401, "E-mail ou senha inválidos");
  }

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

  if (!conta) {
    throw new AppError(404, "Conta não encontrada");
  }

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
