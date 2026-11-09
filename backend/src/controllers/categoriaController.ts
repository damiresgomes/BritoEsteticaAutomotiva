import { Request, Response } from "express";
import { cadastroCategoriaSchema } from "../schemas/categoriaSchema";
import { formatarRespostaListagem, paginacaoQuerySchema } from "../schemas/paginacaoSchema";
import { validarId } from "../validators/validaId";
import {
  atualizarCategoria,
  buscarCategoria,
  cadastrarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../services/categoriaService";

export async function cadastrarCategoriaController(request: Request, response: Response): Promise<Response> {
  const dados = cadastroCategoriaSchema.parse(request.body);
  const { id } = await cadastrarCategoria(dados);

  return response.status(201).json({
    message: "Categoria cadastrada com sucesso",
    id,
  });
}

export async function listarCategoriasController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { categorias, total } = await listarCategorias(pagina, limite);

  response.setHeader("X-Total-Count", total.toString());
  const resposta = formatarRespostaListagem(categorias, total, pagina, limite);
  return response.status(200).json(resposta);
}

export async function buscarCategoriaController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "categoria");
  const categoria = await buscarCategoria(id);
  return response.status(200).json(categoria);
}

export async function atualizarCategoriaController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "categoria");
  const dados = cadastroCategoriaSchema.parse(request.body);
  await atualizarCategoria(id, dados);

  return response.status(200).json({ message: "Categoria atualizada com sucesso" });
}

export async function excluirCategoriaController(request: Request, response: Response): Promise<Response> {
  const id = validarId(request.params.id, "categoria");
  await excluirCategoria(id);

  return response.status(200).json({ message: "Categoria excluída com sucesso" });
}
