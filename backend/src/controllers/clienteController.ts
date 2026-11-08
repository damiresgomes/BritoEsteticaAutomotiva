import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { atualizarClienteUsuarioSchema, cadastroClienteSchema } from "../schemas/clienteSchema";
import {
    buscarClientePorId,
    cadastrarCliente,
    clienteAtualizar,
    excluirCliente,
    listarClientes,
} from "../services/clienteService";

function validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(400, "ID de cliente inválido");
    }
}

export async function cadastrarClienteController(request: Request, response: Response): Promise<Response> {
    const dados = cadastroClienteSchema.parse(request.body);
    const { id } = await cadastrarCliente(dados);

    return response.status(201).json({
        message: "Cliente cadastrado com sucesso",
        id,
    });
}

export async function listarClientesController(_request: Request, response: Response): Promise<Response> {
    return response.status(200).json(await listarClientes());
}

export async function buscarClientePorIdController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    return response.status(200).json(await buscarClientePorId(id));
}

export async function atualizarClienteController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    const dados = atualizarClienteUsuarioSchema.parse(request.body);
    await clienteAtualizar(id, dados);

    return response.status(200).json({ message: "Cliente atualizado com sucesso" });
}

export async function desativarClienteController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    await excluirCliente(id);

    return response.status(200).json({ message: "Cliente desativado com sucesso" });
}
