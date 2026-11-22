import { Router } from "express";
import {
  buscarServicoPorIdController,
  cadastrarServicoController,
  listarServicosController,
  atualizarServicoController,
  excluirServicoController,
} from "../controllers/servicoController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";

export function servicoRoutes(): Router {
  const router = Router();
  router.post("/cadastro", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  router.post("/", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  router.put("/atualizar/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  router.put("/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  router.delete("/deletar/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);
  router.delete("/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);
  router.get("/listar", listarServicosController);
  router.get("/", listarServicosController);
  router.get("/:id", buscarServicoPorIdController);

  return router;
}
