import { AppError } from "../errors/AppError";
import {
    atualizarCategoria as atualizarCategoriaRepositorio,
    buscarCategoriaPorId,
    buscarCategoriaPorNomeExato,
    criarCategoria,
    excluirCategoria as excluirCategoriaRepositorio,
    existeServicoNaCategoria,
    listarCategorias as listarCategoriasRepositorio,
} from "../repositories/categoriaRepository";
import { CadastroCategoriaInput } from "../schemas/categoriaSchema";

export async function cadastrarCategoria(dados: CadastroCategoriaInput): Promise<{ id: number }> {
    if (await buscarCategoriaPorNomeExato(dados.nome_categoria)) {
        throw new AppError(409, "Nome de categoria já cadastrado.");
    }

    return { id: await criarCategoria(dados) };
}

export async function listarCategorias() {
    return listarCategoriasRepositorio();
}

export async function buscarCategoria(id_categoria: number) {
    const categoria = await buscarCategoriaPorId(id_categoria);

    if (!categoria) {
        throw new AppError(404, "Categoria não encontrada.");
    }

    return categoria;
}

export async function atualizarCategoria(id_categoria: number, dados: CadastroCategoriaInput): Promise<void> {
    await buscarCategoria(id_categoria);

    const categoriaComMesmoNome = await buscarCategoriaPorNomeExato(dados.nome_categoria);

    if (categoriaComMesmoNome && categoriaComMesmoNome.id_categoria !== id_categoria) {
        throw new AppError(409, "Nome de categoria já cadastrado.");
    }

    await atualizarCategoriaRepositorio(id_categoria, dados);
}

export async function excluirCategoria(id_categoria: number): Promise<void> {
    await buscarCategoria(id_categoria);

    if (await existeServicoNaCategoria(id_categoria)) {
        throw new AppError(409, "Não é possível excluir uma categoria com serviços vinculados.");
    }

    await excluirCategoriaRepositorio(id_categoria);
}
