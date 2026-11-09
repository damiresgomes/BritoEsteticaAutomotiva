import bcrypt from "bcrypt";
import {
  buscarPorId,
  buscarClientes,
  criarCliente,
  desativarCliente,
  atualizarCliente,
  buscarContaClientePorId,
  atualizarCadastroCliente,
} from "../repositories/clienteRepository";
import { ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
import { Cliente } from "../entities/cliente";
import { AtualizarClienteInput, CadastroClienteInput } from "../schemas/clienteSchema";

export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
  // Instancia entidade para acionar validação de domínio
  new Cliente(0, dados.nome, dados.email, dados.telefone);

  const senhaHash = await bcrypt.hash(dados.senha, 10);
  try {
    const id = await criarCliente({ ...dados, senhaHash });
    return { id };
  } catch (erro) {
    if ((erro as { code?: string })?.code === "ER_DUP_ENTRY") {
      throw new ConflitoError("E-mail já cadastrado.");
    }
    throw erro;
  }
}

export async function buscarPerfilCliente(id: number): Promise<Cliente> {
  const cliente = await buscarContaClientePorId(id);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  return cliente;
}

export async function atualizarMeuCadastroCliente(id: number, dados: AtualizarClienteInput): Promise<void> {
  const cliente = await buscarPorId(id);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);
  cliente.atualizarCadastro(dados.nome, dados.telefone, senhaHash);

  const atualizado = await atualizarCadastroCliente(id, {
    nome: cliente.nome,
    senhaHash,
    telefone: cliente.telefone,
  });

  if (atualizado === 0) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }
}

export async function listarClientes(pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  return buscarClientes(limite, offset);
}

export async function buscarClientePorId(id_cliente: number): Promise<Cliente> {
  const cliente = await buscarPorId(id_cliente);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado.");
  }
  return cliente;
}

export async function clienteAtualizar(
  id_cliente: number,
  dados: { nome: string; email: string; telefone: string }
): Promise<number> {
  const cliente = await buscarPorId(id_cliente);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  const clienteAtualizado = await atualizarCliente(id_cliente, dados);
  if (clienteAtualizado === 0) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para atualização.");
  }

  return clienteAtualizado;
}

export async function excluirCliente(id_cliente: number): Promise<number> {
  const cliente = await buscarPorId(id_cliente);
  if (!cliente) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para desativação.");
  }

  const clienteExcluido = await desativarCliente(id_cliente);
  if (clienteExcluido === 0) {
    throw new RecursoNaoEncontradoError("Cliente não encontrado para desativação.");
  }

  return clienteExcluido;
}
