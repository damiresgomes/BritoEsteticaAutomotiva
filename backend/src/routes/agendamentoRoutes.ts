import { Router } from "express";
import {
  atualizarAgendamentoAdminController,
  atualizarMeuAgendamentoController,
  atualizarStatusAgendamentoController,
  buscarMeuAgendamentoController,
  cadastrarAgendamentoAdminController,
  cadastrarAgendamentoController,
  cancelarAgendamentoAdminController,
  cancelarMeuAgendamentoController,
  criarAgendamentoController,
  listarAgendamentosAdminController,
  listarAgendamentosUsuarioController,
  listarHorariosController,
  listarMeusAgendamentosController,
} from "../controllers/agendamentoController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";

export function agendamentoRoutes(): Router {
  const router = Router();

  // Rota de consulta de horários (acessível por cliente e admin)
  router.get("/horarios", listarHorariosController);

  // Rotas do frontend existente (painel administrativo e agendamento web)
  router.post("/cadastro", authMiddleware, exigirPapel("cliente"), cadastrarAgendamentoController);
  router.get("/admin", authMiddleware, exigirPapel("admin"), listarAgendamentosAdminController);
  router.post("/admin", authMiddleware, exigirPapel("admin"), cadastrarAgendamentoAdminController);
  router.put("/admin/:id", authMiddleware, exigirPapel("admin"), atualizarAgendamentoAdminController);
  router.delete("/admin/:id", authMiddleware, exigirPapel("admin"), cancelarAgendamentoAdminController);

  // Rotas da branch feature (arquitetura nova com clienteAuthMiddleware e painel de usuário)
  router.post("/cliente", clienteAuthMiddleware, criarAgendamentoController);
  router.get("/cliente/meus", clienteAuthMiddleware, listarMeusAgendamentosController);
  router.put("/cliente/meus/:id", clienteAuthMiddleware, atualizarMeuAgendamentoController);
  router.patch("/cliente/meus/:id/cancelar", clienteAuthMiddleware, cancelarMeuAgendamentoController);
  router.get("/cliente/meus/:id", clienteAuthMiddleware, buscarMeuAgendamentoController);
  router.get("/usuario", authMiddleware, listarAgendamentosUsuarioController);
  router.patch("/usuario/:id/status", authMiddleware, atualizarStatusAgendamentoController);

  return router;
}
