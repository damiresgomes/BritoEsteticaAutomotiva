import bcrypt from "bcrypt";
import { AppError, ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  atualizarPerfilUsuario,
  atualizarUsuario,
  buscarPorCpf,
  buscarPorEmail,
  buscarPorId,
  buscarTodos,
  criarUsuario,
  desativarUsuario,
} from "../repositories/usuarioRepository";
import {
  AtualizacaoUsuarioInput,
  CadastroUsuarioInput,
  perfilAdminSchema,
} from "../schemas/usuarioSchema";
import { normalizarCpf } from "../validators/cpf";
import { Usuario } from "../entities/usuario";
import type { z } from "zod";

export async function cadastrar(dados: CadastroUsuarioInput): Promise<{ id: number }> {
  const cpfNormalizado = normalizarCpf(dados.cpf);

  new Usuario(
    0,
    dados.nome,
    dados.email,
    "",
    cpfNormalizado,
    dados.salario,
    dados.datanascimento,
    "dummy-hash",
    true
  );

  if (await buscarPorEmail(dados.email)) {
    throw new ConflitoError("E-mail já cadastrado");
  }

  if (await buscarPorCpf(cpfNormalizado)) {
    throw new ConflitoError("CPF já cadastrado");
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  const id = await criarUsuario({
    nome: dados.nome,
    email: dados.email,
    senhaHash,
    cpf: cpfNormalizado,
    salario: dados.salario,
    datanascimento: dados.datanascimento,
  });

  return { id };
}

export async function listar(pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  return buscarTodos(limite, offset);
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  const usuario = await buscarPorId(id);
  if (!usuario) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }
  return usuario;
}

export async function atualizar(id: number, dados: AtualizacaoUsuarioInput): Promise<void> {
  const usuario = await buscarPorId(id);
  if (!usuario) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }

  const cpfNormalizado = normalizarCpf(dados.cpf);
  if (cpfNormalizado !== usuario.cpf) {
    const usuarioComMesmoCpf = await buscarPorCpf(cpfNormalizado);
    if (usuarioComMesmoCpf && usuarioComMesmoCpf.id !== id) {
      throw new ConflitoError("CPF já cadastrado");
    }
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  usuario.atualizarDados({
    nome: dados.nome,
    cpf: cpfNormalizado,
    salario: dados.salario,
    dataDeNascimento: dados.datanascimento,
    senhaHash,
  });

  const linhasAfetadas = await atualizarUsuario(id, {
    nome: usuario.nome,
    senhaHash,
    cpf: usuario.cpf,
    salario: usuario.salario,
    datanascimento: usuario.dataDeNascimento,
  });

  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado para atualização");
  }
}

export async function excluir(id: number): Promise<void> {
  const usuario = await buscarPorId(id);
  if (!usuario) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado");
  }

  const linhasAfetadas = await desativarUsuario(id);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Usuário não encontrado para desativação");
  }
}

export async function atualizarPerfilAdministrador(
  id: number,
  dados: z.infer<typeof perfilAdminSchema>
): Promise<void> {
  const usuario = await buscarPorId(id);
  if (!usuario) throw new AppError(404, "Usuário não encontrado.");

  const cpf = normalizarCpf(dados.cpf);
  if (cpf !== normalizarCpf(usuario.cpf) && (await buscarPorCpf(cpf))) {
    throw new AppError(409, "CPF já cadastrado.");
  }

  await atualizarPerfilUsuario(id, {
    nome: dados.nome,
    cpf,
    ...(dados.senha ? { senhaHash: await bcrypt.hash(dados.senha, 10) } : {}),
    salario: dados.salario,
    datanascimento: dados.datanascimento,
  });
}
