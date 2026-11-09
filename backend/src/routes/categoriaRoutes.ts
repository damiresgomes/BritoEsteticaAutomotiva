import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  atualizarCategoriaController,
  buscarCategoriaController,
  cadastrarCategoriaController,
  excluirCategoriaController,
  listarCategoriasController,
} from "../controllers/categoriaController";

export function categoriaRoutes(): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get("/", listarCategoriasController);
  router.get("/:id", buscarCategoriaController);
  router.post("/", cadastrarCategoriaController);
  router.put("/:id", atualizarCategoriaController);
  router.delete("/:id", excluirCategoriaController);

  return router;
}
