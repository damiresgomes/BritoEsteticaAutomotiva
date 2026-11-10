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

  // Rotas autenticadas do CRUD administrativo
  router.post("/cadastro", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  router.post("/", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  router.put("/atualizar/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  router.put("/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  router.delete("/deletar/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);
  router.delete("/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);

  // Listagem e detalhes públicos (compatível com o site e o painel)
  router.get("/listar", listarServicosController);
  router.get("/", listarServicosController);
  router.get("/:id", buscarServicoPorIdController);

  return router;
}
