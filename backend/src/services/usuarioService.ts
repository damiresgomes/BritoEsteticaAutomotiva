import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";
import { buscarPorCpf, criarUsuario,buscarTodos, buscarPorId, atualizarUsuario,
desativarUsuario,} from "../repositories/usuarioRepository";
import { emailEmUso } from "../repositories/contaAcessoRepository";
import { CadastroUsuarioInput, AtualizacaoUsuarioInput } from "../schemas/usuarioSchema";
import { normalizarCpf } from "../validators/cpf";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

function existeDuplicidade(erro: unknown): boolean {
  const erroBanco = erro as ErroDeBanco | null;

  return erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062;
}

export async function cadastrar(dados: CadastroUsuarioInput): Promise<{ id: number }> {
  if (await emailEmUso(dados.email)) {
    throw new AppError(409, "E-mail já cadastrado");
  }

  const cpf = normalizarCpf(dados.cpf);

  if (await buscarPorCpf(cpf)) {
    throw new AppError(409, "CPF já cadastrado");
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  try {
    const id = await criarUsuario({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      cpf,
      salario: dados.salario,
      datanascimento: dados.datanascimento,
    });

    return { id };
  } catch (erro) {
    if (existeDuplicidade(erro)) {
      throw new AppError(409, "E-mail ou CPF já cadastrado");
    }

    throw erro;
  }
}


export async function listar(): Promise<{ id: number; nome: string; email: string }[]> {
  return buscarTodos();
}

export async function buscarUsuarioPorId(id: number) {
  const usuario = await buscarPorId(id);

  if (!usuario) {
    throw new AppError(404, "Usuário não encontrado");
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    dataNascimento: usuario.dataDeNascimento,
    salario: usuario.salario,
    ativo: usuario.ativo,
  };
}

export async function atualizar(id: number, dados: AtualizacaoUsuarioInput): Promise<void> {
  const usuario = await buscarPorId(id);

  if (!usuario) {
    throw new AppError(404, "Usuário não encontrado");
  }

  if (dados.email && dados.email !== usuario.email) {
    if (await emailEmUso(dados.email, id)) {
      throw new AppError(409, "E-mail já cadastrado");
    }
  }

  const cpf = dados.cpf ? normalizarCpf(dados.cpf) : usuario.cpf;

  if (cpf !== usuario.cpf) {
    if (await buscarPorCpf(cpf)) {
      throw new AppError(409, "CPF já cadastrado");
    }
  }

  const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : usuario.senhaHash;

  try {
    await atualizarUsuario(id, {
      nome: dados.nome ?? usuario.nome,
      email: dados.email ?? usuario.email,
      senhaHash,
      cpf,
      salario: dados.salario ?? usuario.salario,
      datanascimento: dados.datanascimento ?? usuario.dataDeNascimento,
    });
  } catch (erro) {
    if (existeDuplicidade(erro)) {
      throw new AppError(409, "E-mail ou CPF já cadastrado");
    }

    throw erro;
  }
}

export async function excluir(id: number): Promise<void> {
  const usuario = await buscarPorId(id);

  if (!usuario) {
    throw new AppError(404, "Usuário não encontrado");
  }

  await desativarUsuario(id);
}