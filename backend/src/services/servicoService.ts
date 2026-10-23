import { ServicoRepository } from "../repositories/servicoRepository";
import { AppError } from "../errors/AppError";
import { CadastroServicoInput } from "../schemas/servicoSchema";
import { Servico } from "../types/servico";

export class ServicoService {
    constructor(private readonly servicoRepository: ServicoRepository) { }

    async cadastrarServico(dados: CadastroServicoInput): Promise<{ id: number }> {
        const nomeServicoJaCadastrado = await this.servicoRepository.buscarServico(dados.nome_servico)

        if (nomeServicoJaCadastrado) {
            throw new AppError(409, "Nome de serviço já cadastrado.")
        }

        const id = await this.servicoRepository.
            criarServico({
                nome_servico: dados.nome_servico,
                descricao: dados.descricao,
                preco: dados.preco,
                duracao_horas: dados.duracao_horas,
                id_categoria: dados.id_categoria,
            });

        return { id };
    }

    async listarServicos(): Promise<Servico[]> {
        return this.servicoRepository.listarServicos();
    }
}