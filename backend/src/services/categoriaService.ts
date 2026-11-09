import { ConflitoError, RecursoNaoEncontradoError } from "../errors/AppError";
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
import { Categoria } from "../entities/categoria";

export async function cadastrarCategoria(dados: CadastroCategoriaInput): Promise<{ id: number }> {
  // Cria temporariamente a entidade para disparar validação de regras de domínio encapsuladas
  new Categoria(0, dados.nome_categoria);

  if (await buscarCategoriaPorNomeExato(dados.nome_categoria)) {
    throw new ConflitoError("Nome de categoria já cadastrado.");
  }

  const id = await criarCategoria(dados.nome_categoria.trim());
  return { id };
}

export async function listarCategorias(pagina?: number, limite?: number) {
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  return listarCategoriasRepositorio(limite, offset);
}

export async function buscarCategoria(id_categoria: number): Promise<Categoria> {
  const categoria = await buscarCategoriaPorId(id_categoria);

  if (!categoria) {
    throw new RecursoNaoEncontradoError("Categoria não encontrada.");
  }

  return categoria;
}

export async function atualizarCategoria(id_categoria: number, dados: CadastroCategoriaInput): Promise<void> {
  const categoria = await buscarCategoria(id_categoria);

  // Executa validação de domínio através da classe de entidade
  categoria.atualizarNome(dados.nome_categoria);

  const categoriaComMesmoNome = await buscarCategoriaPorNomeExato(dados.nome_categoria);
  if (categoriaComMesmoNome && categoriaComMesmoNome.id !== id_categoria) {
    throw new ConflitoError("Nome de categoria já cadastrado.");
  }

  const linhasAfetadas = await atualizarCategoriaRepositorio(id_categoria, categoria.nome);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Categoria não encontrada para atualização.");
  }
}

export async function excluirCategoria(id_categoria: number): Promise<void> {
  await buscarCategoria(id_categoria);

  if (await existeServicoNaCategoria(id_categoria)) {
    throw new ConflitoError("Não é possível excluir uma categoria com serviços vinculados.");
  }

  const linhasAfetadas = await excluirCategoriaRepositorio(id_categoria);
  if (linhasAfetadas === 0) {
    throw new RecursoNaoEncontradoError("Categoria não encontrada para exclusão.");
  }
}
