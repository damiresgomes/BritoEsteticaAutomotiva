import { Request, Response } from "express";
import { cadastroServicoSchema, listarServicosQuerySchema } from "../schemas/servicoSchema";
import { cadastrarServico, excluirServico, atualizarServico, listarServicos } from "../services/servicoService";


export async function cadastrarServicoController(request: Request, response: Response): Promise<Response> {
    const dados = cadastroServicoSchema.parse(request.body);
    const { id } = await cadastrarServico(dados);

    return response.status(201).json({
        message: "Serviço cadastrado com sucesso",
        id,
    });
}

export async function listarServicosController(request: Request, response: Response): Promise<Response> {
    const servicos = await listarServicos();

    return response.status(200).json(servicos);
}

export async function listarServicosPublicosController(request: Request, response: Response): Promise<Response> {
    const { categoria } = listarServicosQuerySchema.parse(request.query);
    const servicos = await listarServicos(categoria);

    return response.status(200).json(servicos);
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