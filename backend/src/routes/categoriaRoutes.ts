import { Router } from "express";
import {
  atualizarCategoriaController,
  buscarCategoriaController,
  cadastrarCategoriaController,
  excluirCategoriaController,
  listarCategoriasController,
} from "../controllers/categoriaController";

// Exporta a função 'categoriaRoutes'() para ser reutilizada em outras camadas.
export function categoriaRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();

  // Executa: router.get(["/", "/listar"], listarCategoriasController);.
  router.get(["/", "/listar"], listarCategoriasController);
  // Registra rota HTTP GET '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/:id", buscarCategoriaController);
  // Executa: router.post(["/", "/cadastro"], cadastrarCategoriaController);.
  router.post(["/", "/cadastro"], cadastrarCategoriaController);
  // Executa: router.put(["/:id", "/atualizar/:id"], atualizarCategoriaController);.
  router.put(["/:id", "/atualizar/:id"], atualizarCategoriaController);
  // Executa: router.delete(["/:id", "/deletar/:id"], excluirCategoriaController);.
  router.delete(["/:id", "/deletar/:id"], excluirCategoriaController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints HTTP de categorias.
