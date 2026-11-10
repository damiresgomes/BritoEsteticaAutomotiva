import { Router } from "express";
import {
  atualizarCategoriaController,
  buscarCategoriaController,
  cadastrarCategoriaController,
  excluirCategoriaController,
  listarCategoriasController,
} from "../controllers/categoriaController";

export function categoriaRoutes(): Router {
  const router = Router();

  router.get(["/", "/listar"], listarCategoriasController);
  router.get("/:id", buscarCategoriaController);
  router.post(["/", "/cadastro"], cadastrarCategoriaController);
  router.put(["/:id", "/atualizar/:id"], atualizarCategoriaController);
  router.delete(["/:id", "/deletar/:id"], excluirCategoriaController);

  return router;
}
