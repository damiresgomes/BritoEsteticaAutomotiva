import { AppError } from "../errors/AppError";
import {
  atualizarCategoria,
  buscarCategoria,
  categoriaTemServicos,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../repositories/categoriaRepository";

export async function listar(): ReturnType<typeof listarCategorias> {
  return listarCategorias();
}

export async function criar(nome: string): Promise<number> {
  return criarCategoria(nome);
}

export async function atualizar(id: number, nome: string): Promise<void> {
  if (!(await buscarCategoria(id))) {
    throw new AppError(404, "Categoria não encontrada.");
  }
  await atualizarCategoria(id, nome);
}

export async function excluir(id: number): Promise<void> {
  if (!(await buscarCategoria(id))) {
    throw new AppError(404, "Categoria não encontrada.");
  }
  if (await categoriaTemServicos(id)) {
    throw new AppError(409, "Não é possível excluir uma categoria que possui serviços.");
  }
  await excluirCategoria(id);
}
