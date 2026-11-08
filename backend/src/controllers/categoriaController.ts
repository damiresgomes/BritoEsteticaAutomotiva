import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { cadastroCategoriaSchema } from "../schemas/categoriaSchema";
import {
    atualizarCategoria,
    buscarCategoria,
    cadastrarCategoria,
    excluirCategoria,
    listarCategorias,
} from "../services/categoriaService";

function validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(400, "ID de categoria inválido");
    }
}

export async function cadastrarCategoriaController(request: Request, response: Response): Promise<Response> {
    const dados = cadastroCategoriaSchema.parse(request.body);
    const { id } = await cadastrarCategoria(dados);

    return response.status(201).json({
        message: "Categoria cadastrada com sucesso",
        id,
    });
}

export async function listarCategoriasController(_request: Request, response: Response): Promise<Response> {
    return response.status(200).json(await listarCategorias());
}

export async function buscarCategoriaController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    return response.status(200).json(await buscarCategoria(id));
}

export async function atualizarCategoriaController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    const dados = cadastroCategoriaSchema.parse(request.body);
    await atualizarCategoria(id, dados);

    return response.status(200).json({ message: "Categoria atualizada com sucesso" });
}

export async function excluirCategoriaController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);
    validarId(id);

    await excluirCategoria(id);

    return response.status(200).json({ message: "Categoria excluída com sucesso" });
}
