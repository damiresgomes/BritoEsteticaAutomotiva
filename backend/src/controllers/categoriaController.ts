import { Request, Response } from "express";
import { categoriaSchema } from "../schemas/categoriaSchema";
import * as categoriaService from "../services/categoriaService";

export async function listarCategoriasController(
  _request: Request,
  response: Response
): Promise<Response> {
  return response.status(200).json(await categoriaService.listar());
}

export async function criarCategoriaController(
  request: Request,
  response: Response
): Promise<Response> {
  const dados = categoriaSchema.parse(request.body);
  const id = await categoriaService.criar(dados.nome_categoria);
  return response
    .status(201)
    .json({ id, message: "Categoria cadastrada com sucesso." });
}

export async function atualizarCategoriaController(
  request: Request,
  response: Response
): Promise<Response> {
  const dados = categoriaSchema.parse(request.body);
  await categoriaService.atualizar(Number(request.params.id), dados.nome_categoria);
  return response.status(200).json({ message: "Categoria atualizada com sucesso." });
}

export async function excluirCategoriaController(
  request: Request,
  response: Response
): Promise<Response> {
  await categoriaService.excluir(Number(request.params.id));
  return response.status(200).json({ message: "Categoria excluída com sucesso." });
}