import bcrypt from "bcrypt";
import { ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  buscarPorEmail,
  buscarPorCpf,
  criarUsuario,
  buscarTodos,
  buscarPorId,
  atualizarUsuario,
  desativarUsuario,
} from "../repositories/usuarioRepository";
import { CadastroUsuarioInput, AtualizacaoUsuarioInput } from "../schemas/usuarioSchema";
import { normalizarCpf } from "../validators/cpf";
import { Usuario } from "../entities/usuario";

export async function cadastrar(dados: CadastroUsuarioInput): Promise<{ id: number }> {
  const cpfNormalizado = normalizarCpf(dados.cpf);

  // Instancia a entidade para acionar validações ricas de domínio
  new Usuario(0, dados.nome, dados.email, "", cpfNormalizado, dados.salario, dados.datanascimento, "");

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

  // Atualiza através dos métodos da entidade
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
