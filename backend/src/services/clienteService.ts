import bcrypt from "bcrypt";
import { AppError, ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import {
  atualizarCadastroCliente,
  atualizarCliente as atualizarClienteRepositorio,
  atualizarClienteAdmin,
  buscarClienteAdmin,
  buscarContaClientePorId,
  contarClientesAdmin,
  buscarPorId,
  criarCliente,
  criarClienteAdmin,
  desativarCliente,
  desativarClienteAdmin,
  listarClientesAdmin,
  reativarClienteAdmin,
  atualizarSenhaContaCliente,
  type DadosClienteAdmin,
} from "../repositories/clienteRepository";
import type { z } from "zod";
import {
  atualizacaoClienteAdminSchema,
  atualizarClienteSchema,
  AtualizarClienteInput,
  cadastroClienteAdminSchema,
  cadastroClienteSchema,
  CadastroClienteInput,
} from "../schemas/clienteSchema";
import { Cliente } from "../entities/cliente";
import { normalizarCpf } from "../validators/cpf";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

function emailDuplicado(erro: unknown): boolean {
  const erroBanco = erro as ErroDeBanco | null;
  return erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062;
}

export async function listarClientes(pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  const [clientes, total] = await Promise.all([
    listarClientesAdmin(limite, offset),
    contarClientesAdmin(),
  ]);
  return { clientes, total };
}

export async function buscarCliente(id: number) {
  const cliente = await buscarClienteAdmin(id);
  if (!cliente) throw new AppError(404, "Cliente não encontrado.");
  return cliente;
}

export async function buscarClientePorId(id_cliente: number): Promise<Cliente> {
  const cliente = await buscarPorId(id_cliente);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  return cliente;
}

export async function buscarPerfilCliente(id: number): Promise<Cliente> {
  const cliente = await buscarContaClientePorId(id);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  return cliente;
}

export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
  const cpf = normalizarCpf(dados.cpf);
  new Cliente(0, dados.nome, dados.email, dados.telefone, true);
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  try {
    const id = await criarCliente({ ...dados, cpf, senhaHash });
    return { id };
  } catch (erro) {
    if ((erro as { code?: string })?.code === "ER_DUP_ENTRY") {
      throw new ConflitoError("E-mail já cadastrado.");
    }
    throw erro;
  }
}

export async function cadastrarClienteAdmin(
  dados: z.infer<typeof cadastroClienteAdminSchema>
): Promise<number> {
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  try {
    const id = await criarClienteAdmin({ ...dados, senhaHash });
    if (id === "email-em-uso") throw new AppError(409, "E-mail já cadastrado.");
    return id;
  } catch (erro) {
    if (emailDuplicado(erro)) throw new AppError(409, "E-mail ou CPF já cadastrado.");
    throw erro;
  }
}

export async function atualizarMeuCadastroCliente(id: number, dados: AtualizarClienteInput): Promise<void> {
  const cliente = await buscarPorId(id);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }

  const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
  cliente.atualizarCadastro(dados.nome, dados.telefone, senhaHash);

  const atualizado = await atualizarCadastroCliente(id, {
    nome: cliente.nome,
    senhaHash,
    telefone: cliente.telefone,
    cpf: normalizarCpf(dados.cpf),
  });

  if (atualizado === 0) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  if (senhaHash) {
    await atualizarSenhaContaCliente(id, senhaHash);
  }
}

export async function clienteAtualizar(
  id_cliente: number,
  dados: { nome: string; email: string; telefone: string }
): Promise<number> {
  const cliente = await buscarPorId(id_cliente);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  const clienteAtualizado = await atualizarClienteRepositorio(id_cliente, dados);
  if (clienteAtualizado === 0) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  return clienteAtualizado;
}

export async function atualizarCliente(
  id: number,
  dados: z.infer<typeof atualizacaoClienteAdminSchema>
): Promise<void> {
  const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
  const dadosCliente: DadosClienteAdmin = {
    nome: dados.nome,
    email: dados.email,
    cpf: dados.cpf,
    telefone: dados.telefone,
    ...(senhaHash ? { senhaHash } : {}),
  };

  try {
    const resultado = await atualizarClienteAdmin(id, dadosCliente);
    if (resultado === "nao-encontrado") throw new AppError(404, "Cliente não encontrado.");
    if (resultado === "email-em-uso") throw new AppError(409, "E-mail já cadastrado.");
    if (resultado === "senha-obrigatoria") {
      throw new AppError(400, "Informe uma senha inicial para criar o acesso deste cliente.");
    }
  } catch (erro) {
    if (erro instanceof AppError) throw erro;
    if (emailDuplicado(erro)) throw new AppError(409, "E-mail ou CPF já cadastrado.");
    throw erro;
  }
}

export async function excluirCliente(id: number): Promise<string | number> {
  try {
    const resultado = await desativarClienteAdmin(id);
    if (resultado === "nao-encontrado") throw new AppError(404, "Cliente não encontrado.");
    if (resultado === "historico-sem-conta") {
      throw new AppError(
        409,
        "Este cliente tem agendamentos históricos, mas não possui conta para desativar. Crie o acesso do cliente antes de removê-lo."
      );
    }
    return resultado;
  } catch (erro) {
    if (erro instanceof AppError) throw erro;
    const linhasAfetadas = await desativarCliente(id);
    if (linhasAfetadas === 0) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }
    return linhasAfetadas;
  }
}

export async function ativarCliente(id: number): Promise<void> {
  if (!(await reativarClienteAdmin(id))) {
    throw new AppError(404, "Conta de cliente não encontrada.");
  }
}
