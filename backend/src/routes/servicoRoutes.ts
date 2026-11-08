import { Router } from "express";
import { buscarServicoPorIdController, cadastrarServicoController, listarServicosController, atualizarServicoController, excluirServicoController } from "../controllers/servicoController";
import { authMiddleware } from "../middlewares/authMiddleware";


export function servicoRoutes(): Router {
  const router = Router();

  router.post("/cadastro", authMiddleware, cadastrarServicoController);

  router.get("/listar", listarServicosController);

  router.get("/:id", buscarServicoPorIdController);

  router.put("/atualizar/:id", authMiddleware, atualizarServicoController);

  router.delete("/deletar/:id", authMiddleware, excluirServicoController);

  return router;
}
