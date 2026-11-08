import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { cadastroServicoSchema } from "../schemas/servicoSchema";
import { cadastrarServico, excluirServico, atualizarServico, buscarServicoPorId, listarServicos } from "../services/servicoService";


export async function cadastrarServicoController(request: Request, response: Response): Promise<Response> {
    const dados = cadastroServicoSchema.parse(request.body);
    const { id } = await cadastrarServico(dados);

    return response.status(201).json({
        message: "Serviço cadastrado com sucesso",
        id,
    });
}

export async function listarServicosController(request: Request, response: Response): Promise<Response> {
    const nome = typeof request.query.nome === "string" ? request.query.nome.trim() : undefined;
    const idInformado = typeof request.query.id === "string" ? Number(request.query.id) : undefined;
    const id = idInformado !== undefined && Number.isInteger(idInformado) && idInformado > 0 ? idInformado : undefined;

    const servicos = await listarServicos(nome, id);

    return response.status(200).json(servicos);
}

export async function buscarServicoPorIdController(request: Request, response: Response): Promise<Response> {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(400, "ID de serviço inválido");
    }

    return response.status(200).json(await buscarServicoPorId(id));
}

export async function excluirServicoController(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    await excluirServico(Number(id));

    return response.status(200).json({
        message: "Serviço excluído com sucesso",
    });
}

export async function atualizarServicoController(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const dados = cadastroServicoSchema.parse(request.body);
    await atualizarServico(Number(id), dados);

    return response.status(200).json({
        message: "Serviço atualizado com sucesso",
    });
}