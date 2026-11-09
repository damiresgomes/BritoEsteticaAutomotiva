import { Router } from "express";
import {
  atualizarAgendamentoAdminController,
  cadastrarAgendamentoAdminController,
  cadastrarAgendamentoController,
  cancelarAgendamentoAdminController,
  listarAgendamentosAdminController,
  listarHorariosController,
} from "../controllers/agendamentoController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";

export function agendamentoRoutes() {
  const router = Router();

  router.get("/horarios", authMiddleware, exigirPapel("cliente"), listarHorariosController);
  router.post("/cadastro", authMiddleware, exigirPapel("cliente"), cadastrarAgendamentoController);
  router.get("/admin", authMiddleware, exigirPapel("admin"), listarAgendamentosAdminController);
  router.post("/admin", authMiddleware, exigirPapel("admin"), cadastrarAgendamentoAdminController);
  router.put("/admin/:id", authMiddleware, exigirPapel("admin"), atualizarAgendamentoAdminController);
  router.delete("/admin/:id", authMiddleware, exigirPapel("admin"), cancelarAgendamentoAdminController);

  return router;
}
