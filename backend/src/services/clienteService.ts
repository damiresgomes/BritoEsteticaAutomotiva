import bcrypt from "bcrypt";
import { buscarPorId, buscarClientes, criarCliente, desativarCliente, atualizarCliente } from "../repositories/clienteRepository";
import { buscarContaClientePorId } from "../repositories/clienteRepository";
import { AppError } from "../errors/AppError";
import { Cliente } from "../entities/cliente";
import { AtualizarClienteInput, CadastroClienteInput } from "../schemas/clienteSchema";
import { atualizarCadastroCliente } from "../repositories/clienteRepository";

export async function cadastrarCliente(dados: CadastroClienteInput): Promise<{ id: number }> {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    try {
        const id = await criarCliente({ ...dados, senhaHash });
        return { id };
    } catch (erro) {
        if ((erro as { code?: string })?.code === "ER_DUP_ENTRY") {
            throw new AppError(409, "E-mail já cadastrado.");
        }
        throw erro;
    }
}

export async function buscarPerfilCliente(id: number) {
    const cliente = await buscarContaClientePorId(id);
    if (!cliente) throw new AppError(404, "Cliente não encontrado.");
    return cliente;
}

export async function atualizarMeuCadastroCliente(id: number, dados: AtualizarClienteInput): Promise<void> {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const atualizado = await atualizarCadastroCliente(id, {
        nome: dados.nome,
        senhaHash,
        telefone: dados.telefone,
    });

    if (atualizado === 0) {
        throw new AppError(404, "Cliente não encontrado.");
    }
}

export async function listarClientes(): Promise<Cliente[]> {
    return buscarClientes();
}

export async function buscarClientePorId(id_cliente: number): Promise<Cliente> {
    const cliente = await buscarPorId(id_cliente);

    if (!cliente) {
        throw new AppError(404, "Cliente não encontrado.");
    }

    return cliente;
}

export async function clienteAtualizar(id_cliente: number, cliente: { nome: string; email: string; telefone: string }): Promise<number> {
    const clienteAtualizado = await atualizarCliente(id_cliente, cliente);

    if (clienteAtualizado === 0) {
        throw new AppError(404, "Cliente não encontrado.");
    }

    return clienteAtualizado;
}

export async function excluirCliente(id_cliente: number): Promise<number> {
    const clienteExcluido = await desativarCliente(id_cliente);

    if (clienteExcluido === 0) {
        throw new AppError(404, "Cliente não encontrado.");
    }

    return clienteExcluido;
}
