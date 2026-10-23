import { Request, Response } from "express";
import { cadastroServicoSchema } from "../schemas/servicoSchema";
import { ServicoService } from "../services/servicoService";

export class ServicoController {
    constructor(private readonly servicoService: ServicoService) {}

    async cadastrarServico(request: Request, response: Response): Promise<Response> {
        const dados = cadastroServicoSchema.parse(request.body);
        const { id } = await this.servicoService.cadastrarServico(dados);

        return response.status(201).json({
            message: "Serviço cadastrado com sucesso",
            id,
        });
    }

    async listarServicos(request: Request, response: Response): Promise<Response> {
        const servicos = await this.servicoService.listarServicos();

        return response.status(200).json(servicos);
    }
}