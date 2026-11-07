import { Router } from "express";
import {
  cadastrarAgendamentoController,
  listarHorariosController,
} from "../controllers/agendamentoController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";

export function agendamentoRoutes() {
  const router = Router();

  router.use(authMiddleware, exigirPapel("cliente"));
  router.get("/horarios", listarHorariosController);
  router.post("/cadastro", cadastrarAgendamentoController);

  return router;
}
