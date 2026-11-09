import { Router } from "express";
import {
  buscarServicoPorIdController,
  cadastrarServicoController,
  listarServicosController,
  atualizarServicoController,
  excluirServicoController,
} from "../controllers/servicoController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function servicoRoutes(): Router {
  const router = Router();

  // Rotas autenticadas do CRUD administrativo
  router.post("/cadastro", authMiddleware, cadastrarServicoController);
  router.put("/atualizar/:id", authMiddleware, atualizarServicoController);
  router.delete("/deletar/:id", authMiddleware, excluirServicoController);

  // Listagem e detalhes (compatível tanto com catálogo do site quanto painel administrativo)
  router.get("/listar", listarServicosController);
  router.get("/:id", buscarServicoPorIdController);

  return router;
}
