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

// Exporta a função assíncrona 'cadastrarCategoriaController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function cadastrarCategoriaController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroCategoriaSchema.parse(request.body);
  const { id } = await cadastrarCategoria(dados);

  return response.status(201).json({
    // Define a propriedade/campo 'message' no objeto/estrutura.
    message: "Categoria cadastrada com sucesso",
    id,
  });
}

// Exporta a função assíncrona 'listarCategoriasController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarCategoriasController(request: Request, response: Response): Promise<Response> {
  const { pagina, limite } = paginacaoQuerySchema.parse(request.query);
  const { categorias, total } = await listarCategorias(pagina, limite);

  // Executa: response.setHeader("X-Total-Count", total.toString());.
  response.setHeader("X-Total-Count", total.toString());
  // Cria a constante local 'resposta'; usar const evita reatribuição acidental.
  const resposta = formatarRespostaListagem(categorias, total, pagina, limite);
  // Envia resposta HTTP ao cliente: response.status(200).json(resposta).
  return response.status(200).json(resposta);
}

// Exporta a função assíncrona 'buscarCategoriaController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarCategoriaController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "categoria");
  // Cria a constante local 'categoria'; usar const evita reatribuição acidental.
  const categoria = await buscarCategoria(id);
  // Envia resposta HTTP ao cliente: response.status(200).json(categoria).
  return response.status(200).json(categoria);
}

// Exporta a função assíncrona 'atualizarCategoriaController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarCategoriaController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "categoria");
  // Cria a constante local 'dados'; usar const evita reatribuição acidental.
  const dados = cadastroCategoriaSchema.parse(request.body);
  // Aguarda conclusão da operação assíncrona: atualizarCategoria(id, dados);.
  await atualizarCategoria(id, dados);

  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Categoria atualizada com sucesso" }).
  return response.status(200).json({ message: "Categoria atualizada com sucesso" });
}

// Exporta a função assíncrona 'excluirCategoriaController'(request: Request, response: Response); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirCategoriaController(request: Request, response: Response): Promise<Response> {
  // Cria a constante local 'id'; usar const evita reatribuição acidental.
  const id = validarId(request.params.id, "categoria");
  // Aguarda conclusão da operação assíncrona: excluirCategoria(id);.
  await excluirCategoria(id);

  // Envia resposta HTTP ao cliente: response.status(200).json({ message: "Categoria excluída com sucesso" }).
  return response.status(200).json({ message: "Categoria excluída com sucesso" });
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Controller de categorias: CRUD administrativo com validação e paginação/listagem.
