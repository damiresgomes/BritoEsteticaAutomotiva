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

// Exporta a função assíncrona 'cadastrarCategoria'(dados: CadastroCategoriaInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarCategoria(dados: CadastroCategoriaInput): Promise<{ id: number }> {
  new Categoria(0, dados.nome_categoria);

  // Condição: se 'await buscarCategoriaPorNomeExato(dados.nome_categoria)' for verdadeira, o bloco abaixo é executado.
  if (await buscarCategoriaPorNomeExato(dados.nome_categoria)) {
    // Lança 'ConflitoError' com ("Nome de categoria já cadastrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Nome de categoria já cadastrado.");
  }

  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = await criarCategoria(dados.nome_categoria.trim());
  // Retorna { id } para quem chamou esta função.
  return { id };
}

// Exporta a função assíncrona 'listarCategorias'(pagina?: number, limite?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarCategorias(pagina?: number, limite?: number) {
  // Cria a constante local 'offset'; usar const evita reatribuição acidental.
  const offset = pagina !== undefined && limite !== undefined ? (pagina - 1) * limite : undefined;
  // Retorna listarCategoriasRepositorio(limite, offset) para quem chamou esta função.
  return listarCategoriasRepositorio(limite, offset);
}

// Exporta a função assíncrona 'buscarCategoria'(id_categoria: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarCategoria(id_categoria: number): Promise<Categoria> {
  // Cria a constante local 'categoria'; usar const evita reatribuição acidental.
  const categoria = await buscarCategoriaPorId(id_categoria);

  // Condição: se '!categoria' for verdadeira, o bloco abaixo é executado.
  if (!categoria) {
    // Lança 'RecursoNaoEncontradoError' com ("Categoria não encontrada."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Categoria não encontrada.");
  }

  // Retorna categoria para quem chamou esta função.
  return categoria;
}

// Exporta a função assíncrona 'atualizarCategoria'(id_categoria: number, dados: CadastroCategoriaInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarCategoria(id_categoria: number, dados: CadastroCategoriaInput): Promise<void> {
  // Cria a constante local 'categoria'; usar const evita reatribuição acidental.
  const categoria = await buscarCategoria(id_categoria);
  // Executa: categoria.atualizarNome(dados.nome_categoria);.
  categoria.atualizarNome(dados.nome_categoria);

  // Cria a constante local 'categoriaComMesmoNome'; usar const evita reatribuição acidental.
  const categoriaComMesmoNome = await buscarCategoriaPorNomeExato(dados.nome_categoria);
  // Condição: se 'categoriaComMesmoNome && categoriaComMesmoNome.id !== id_categoria' for verdadeira, o bloco abaixo é executado.
  if (categoriaComMesmoNome && categoriaComMesmoNome.id !== id_categoria) {
    // Lança 'ConflitoError' com ("Nome de categoria já cadastrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Nome de categoria já cadastrado.");
  }

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await atualizarCategoriaRepositorio(id_categoria, categoria.nome);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Categoria não encontrada para atualização."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Categoria não encontrada para atualização.");
  }
}

// Exporta a função assíncrona 'excluirCategoria'(id_categoria: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirCategoria(id_categoria: number): Promise<void> {
  // Aguarda conclusão da operação assíncrona: buscarCategoria(id_categoria);.
  await buscarCategoria(id_categoria);

  // Condição: se 'await existeServicoNaCategoria(id_categoria)' for verdadeira, o bloco abaixo é executado.
  if (await existeServicoNaCategoria(id_categoria)) {
    // Lança 'ConflitoError' com ("Não é possível excluir uma categoria com serviços vinculados."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new ConflitoError("Não é possível excluir uma categoria com serviços vinculados.");
  }

  // Cria a constante local 'linhasAfetadas'; usar const evita reatribuição acidental.
  const linhasAfetadas = await excluirCategoriaRepositorio(id_categoria);
  // Condição: se 'linhasAfetadas === 0' for verdadeira, o bloco abaixo é executado.
  if (linhasAfetadas === 0) {
    // Lança 'RecursoNaoEncontradoError' com ("Categoria não encontrada para exclusão."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RecursoNaoEncontradoError("Categoria não encontrada para exclusão.");
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de negócio de categorias: valida dados e coordena operações do repository.
