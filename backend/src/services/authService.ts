import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { buscarPorEmail,buscarPorId } from "../repositories/usuarioRepository";
import { LoginInput } from "../schemas/authSchema";
import { StatusAtivo } from "../entities/usuario";

const HASH_FICTICIO = bcrypt.hashSync("senha-fantasia", 10);

export async function loginAuthService({ email, senha }: LoginInput): Promise<{ token: string }> {
    const usuario = await buscarPorEmail(email);

    if (!usuario) {
      await bcrypt.compare(senha, HASH_FICTICIO);
      throw new AppError(401, "Dados inválidos!");
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaOk) {
      throw new AppError(401, "Dados inválidos!");
    }

    if (usuario.ativo !== "Sim") {
      throw new AppError(403, "Usuário inativo");
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: "usuario", papel: usuario.papel, jti: randomUUID() },
      env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    return { token };
  }

  export async function buscarUsuarioPorId(id: number): Promise<{
    id: number;
    nome: string;
    email: string;
    ativo: StatusAtivo;
    papel: "admin" | "usuario";
  }> {
    const usuario = await buscarPorId(id);

    if (!usuario) {
      throw new AppError(404, "Usuário não encontrado");
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ativo: usuario.ativo,
      papel: usuario.papel,
    };
  }
