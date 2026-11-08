import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { buscarContaClientePorEmail } from "../repositories/clienteRepository";
import { LoginInput } from "../schemas/authSchema";

const HASH_FICTICIO = bcrypt.hashSync("senha-ficticia-cliente", 10);

export async function loginClienteAuthService({ email, senha }: LoginInput): Promise<{ token: string }> {
  const cliente = await buscarContaClientePorEmail(email);
  const hash = cliente?.senha_hash ?? HASH_FICTICIO;
  const senhaCorreta = await bcrypt.compare(senha, hash);

  if (!cliente || !cliente.senha_hash || !senhaCorreta) {
    throw new AppError(401, "E-mail ou senha inválidos.");
  }

  if (cliente.ativo !== "Sim") {
    throw new AppError(403, "Cliente inativo.");
  }

  const token = jwt.sign(
    { id: cliente.id_cliente, email: cliente.email, tipo: "cliente", jti: randomUUID() },
    env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  return { token };
}