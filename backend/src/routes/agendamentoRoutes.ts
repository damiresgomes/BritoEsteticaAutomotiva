import { Router } from "express";
import {
  atualizarMeuAgendamentoController,
  atualizarStatusAgendamentoController,
  buscarMeuAgendamentoController,
  cancelarMeuAgendamentoController,
  criarAgendamentoController,
  listarAgendamentosUsuarioController,
  listarHorariosController,
  listarMeusAgendamentosController,
} from "../controllers/agendamentoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";

export function agendamentoRoutes(): Router {
  const router = Router();
  router.get("/horarios", listarHorariosController);

  router.post("/cliente", clienteAuthMiddleware, criarAgendamentoController);

  router.get("/cliente/meus", clienteAuthMiddleware, listarMeusAgendamentosController);

  router.put("/cliente/meus/:id", clienteAuthMiddleware, atualizarMeuAgendamentoController);

  router.patch("/cliente/meus/:id/cancelar", clienteAuthMiddleware, cancelarMeuAgendamentoController);

  router.get("/cliente/meus/:id", clienteAuthMiddleware, buscarMeuAgendamentoController);

  router.get("/usuario", authMiddleware, listarAgendamentosUsuarioController);

  router.patch("/usuario/:id/status", authMiddleware, atualizarStatusAgendamentoController);
  
  return router;
}
