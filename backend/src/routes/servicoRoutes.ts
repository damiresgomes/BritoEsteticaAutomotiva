import { Router } from "express";
import { cadastrarServicoController, listarServicosController, atualizarServicoController, excluirServicoController } from "../controllers/servicoController";


export function servicoRoutes(): Router {
  const router = Router();

  router.post("/cadastro", cadastrarServicoController);

  router.get("/listar", listarServicosController);

  router.put("/atualizar/:id", atualizarServicoController);

  router.delete("/deletar/:id", excluirServicoController);

  return router;
}