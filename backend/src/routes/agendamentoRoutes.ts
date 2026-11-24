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

// Exporta a função 'agendamentoRoutes'() para ser reutilizada em outras camadas.
export function agendamentoRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();
  // Registra rota HTTP GET '/horarios' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/horarios", listarHorariosController);
  // Registra rota HTTP POST '/cadastro' neste router; a requisição passará pelos middlewares/handler informados.
  router.post("/cadastro", authMiddleware, exigirPapel("cliente"), cadastrarAgendamentoController);
  // Registra rota HTTP GET '/admin' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/admin", authMiddleware, exigirPapel("admin"), listarAgendamentosAdminController);
  // Registra rota HTTP POST '/admin' neste router; a requisição passará pelos middlewares/handler informados.
  router.post("/admin", authMiddleware, exigirPapel("admin"), cadastrarAgendamentoAdminController);
  // Registra rota HTTP PUT '/admin/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.put("/admin/:id", authMiddleware, exigirPapel("admin"), atualizarAgendamentoAdminController);
  // Registra rota HTTP DELETE '/admin/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.delete("/admin/:id", authMiddleware, exigirPapel("admin"), cancelarAgendamentoAdminController);
  // Registra rota HTTP POST '/cliente' neste router; a requisição passará pelos middlewares/handler informados.
  router.post("/cliente", clienteAuthMiddleware, criarAgendamentoController);
  // Registra rota HTTP GET '/cliente/meus' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/cliente/meus", clienteAuthMiddleware, listarMeusAgendamentosController);
  // Registra rota HTTP PUT '/cliente/meus/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.put("/cliente/meus/:id", clienteAuthMiddleware, atualizarMeuAgendamentoController);
  // Registra rota HTTP PATCH '/cliente/meus/:id/cancelar' neste router; a requisição passará pelos middlewares/handler informados.
  router.patch("/cliente/meus/:id/cancelar", clienteAuthMiddleware, cancelarMeuAgendamentoController);
  // Registra rota HTTP GET '/cliente/meus/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/cliente/meus/:id", clienteAuthMiddleware, buscarMeuAgendamentoController);
  // Registra rota HTTP GET '/usuario' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/usuario", authMiddleware, exigirPapel("admin"), listarAgendamentosUsuarioController);
  // Registra rota HTTP PATCH '/usuario/:id/status' neste router; a requisição passará pelos middlewares/handler informados.
  router.patch("/usuario/:id/status", authMiddleware, exigirPapel("admin"), atualizarStatusAgendamentoController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints HTTP de agendamentos para fluxos admin/cliente/públicos conforme regra.
