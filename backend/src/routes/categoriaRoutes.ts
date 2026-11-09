import { Router } from "express";
import {
  atualizarCategoriaController,
  criarCategoriaController,
  excluirCategoriaController,
  listarCategoriasController,
} from "../controllers/categoriaController";

export function categoriaRoutes(): Router {
  const router = Router();

  router.get("/listar", listarCategoriasController);
  router.post("/cadastro", criarCategoriaController);
  router.put("/atualizar/:id", atualizarCategoriaController);
  router.delete("/deletar/:id", excluirCategoriaController);

  return router;
}