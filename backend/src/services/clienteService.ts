import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";
import {
  atualizarClienteAdmin,
  buscarClienteAdmin,
  criarClienteAdmin,
  desativarClienteAdmin,
  listarClientesAdmin,
  reativarClienteAdmin,
  type DadosClienteAdmin,
} from "../repositories/clienteRepository";
import type { z } from "zod";
import {
  atualizacaoClienteAdminSchema,
  cadastroClienteAdminSchema,
} from "../schemas/clienteSchema";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

function emailDuplicado(erro: unknown): boolean {
  const erroBanco = erro as ErroDeBanco | null;
  return erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062;
}

export async function listarClientes() {
  return listarClientesAdmin();
}

export async function buscarCliente(id: number) {
  const cliente = await buscarClienteAdmin(id);
  if (!cliente) throw new AppError(404, "Cliente não encontrado.");
  return cliente;
}

export async function cadastrarCliente(
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

export async function excluirCliente(id: number): Promise<string> {
  const resultado = await desativarClienteAdmin(id);
  if (resultado === "nao-encontrado") throw new AppError(404, "Cliente não encontrado.");
  if (resultado === "historico-sem-conta") {
    throw new AppError(
      409,
      "Este cliente tem agendamentos históricos, mas não possui conta para desativar. Crie o acesso do cliente antes de removê-lo."
    );
  }
  return resultado;
}

export async function ativarCliente(id: number): Promise<void> {
  if (!(await reativarClienteAdmin(id))) {
    throw new AppError(404, "Conta de cliente não encontrada.");
  }
}
