import {
    buscarServicoPorNomeExato,
    criarServico,
    _atualizarServico,
    _excluirServico,
    listarServicos as listarServicosNoBanco,
    listarServicosPorCategoria,
    type Servico,
} from "../repositories/servicoRepository";
import { AppError } from "../errors/AppError";
import { CadastroServicoInput } from "../schemas/servicoSchema";

export async function cadastrarServico(dados: CadastroServicoInput): Promise<{ id: number }> {
    const nomeServicoJaCadastrado = await buscarServicoPorNomeExato(dados.nome_servico)

    if (nomeServicoJaCadastrado) {
        throw new AppError(409, "Nome de serviço já cadastrado.")
    }

    const id = await criarServico({
        nome_servico: dados.nome_servico,
        descricao: dados.descricao,
        preco: dados.preco,
        duracao_horas: dados.duracao_horas,
        id_categoria: dados.id_categoria,
    });

    return { id };
}

export async function listarServicos(id_categoria?: number): Promise<Servico[]> {
    if (id_categoria === undefined) {
        return listarServicosNoBanco();
    }
    return listarServicosPorCategoria(id_categoria);
}

export async function atualizarServico(id_servico: number, servico: CadastroServicoInput): Promise<number> {
    const servicoAtualizado = await _atualizarServico(id_servico, { ...servico, id_servico })

    if (servicoAtualizado === 0) {
        throw new AppError(404, "Serviço não encontrado.")
    }

    return servicoAtualizado;
}


export async function excluirServico(id_servico: number): Promise<number> {
    const servicoExcluido = await _excluirServico(id_servico)

    if (servicoExcluido === 0) {
        throw new AppError(404, "Serviço não encontrado.")
    }

    return servicoExcluido;
}