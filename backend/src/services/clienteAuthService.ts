import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AcessoProibidoError, NaoAutorizadoError } from "../errors/AppError";
import { buscarContaClientePorEmail } from "../repositories/clienteRepository";
import { buscarContaPorEmail } from "../repositories/contaAcessoRepository";
import { LoginInput } from "../schemas/authSchema";

const HASH_FICTICIO = bcrypt.hashSync("senha-ficticia-cliente", 10);

function hashBcryptCompativel(hash: string): string {
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

export async function loginClienteAuthService({ email, senha }: LoginInput): Promise<{ token: string }> {
  const conta = await buscarContaPorEmail(email);

  if (conta) {
    const senhaCorreta = await bcrypt.compare(senha, hashBcryptCompativel(conta.senhaHash));
    if (!senhaCorreta || conta.papel !== "cliente") {
      throw new NaoAutorizadoError("E-mail ou senha inválidos.");
    }
    if (conta.ativo !== "Sim") {
      throw new AcessoProibidoError("Cliente inativo.");
    }
    if (!conta.clienteId) {
      throw new NaoAutorizadoError("Cliente não encontrado.");
    }

    const token = jwt.sign(
      {
        id: conta.clienteId,
        email: conta.email,
        tipo: "cliente",
        jti: randomUUID(),
      },
      env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    return { token };
  }

  const cliente = await buscarContaClientePorEmail(email);
  const hash = cliente?.senhaHash ?? HASH_FICTICIO;
  const senhaCorreta = await bcrypt.compare(senha, hashBcryptCompativel(hash));

  if (!cliente || !cliente.senhaHash || !senhaCorreta) {
    throw new NaoAutorizadoError("E-mail ou senha inválidos.");
  }

  if (!cliente.ativo) {
    throw new AcessoProibidoError("Cliente inativo.");
  }

  const token = jwt.sign(
    { id: cliente.id, email: cliente.email, tipo: "cliente", jti: randomUUID() },
    env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  return { token };
}
