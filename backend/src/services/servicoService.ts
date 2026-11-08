import { buscarServicoPorNomeExato, buscarServicoPorNome, buscarServico, listarServicos as listarTodosServicos, criarServico, _atualizarServico, _excluirServico, Servico as ServicoPersistido } from "../repositories/servicoRepository";
import { AppError } from "../errors/AppError";
import { CadastroServicoInput } from "../schemas/servicoSchema";
import { Servico } from "../entities/servico";

function converterServico(servico: ServicoPersistido): Servico {
    return new Servico(
        servico.id_servico,
        servico.nome_servico,
        servico.descricao,
        servico.preco,
        servico.duracao_horas,
        servico.id_categoria
    );
}

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

export async function buscarServicoPorId(id_servico: number): Promise<Servico> {
    const servico = await buscarServico(id_servico);

    if (!servico) {
        throw new AppError(404, "Serviço não encontrado.")
    }

    return converterServico(servico);
}

export async function listarServicos(nome?: string, id_servico?: number): Promise<Servico[]> {
    if (!nome && id_servico === undefined) {
        return (await listarTodosServicos()).map(converterServico);
    }

    const resultados = new Map<number, Servico>();
    if (nome) {
        const encontrados = await buscarServicoPorNome(nome);
        for (const servico of encontrados ?? []) resultados.set(servico.id_servico, converterServico(servico));
    }
    if (id_servico !== undefined) {
        const encontrado = await buscarServico(id_servico);
        if (encontrado) resultados.set(encontrado.id_servico, converterServico(encontrado));
    }
    return [...resultados.values()];
}

export async function atualizarServico(id_servico: number, servico: CadastroServicoInput): Promise<number> {
    const servicoExistente = await buscarServico(id_servico)

    if (!servicoExistente) {
        throw new AppError(404, "Serviço não encontrado.")
    }

    return _atualizarServico(id_servico, { ...servico, id_servico })
}


export async function excluirServico(id_servico: number): Promise<number> {
    const servicoExcluido = await _excluirServico(id_servico)

    if (servicoExcluido === 0) {
        throw new AppError(404, "Serviço não encontrado.")
    }
    return servicoExcluido;
}
