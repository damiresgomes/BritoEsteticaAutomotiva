import { Router } from "express";
import {
  buscarServicoPorIdController,
  cadastrarServicoController,
  listarServicosController,
  atualizarServicoController,
  excluirServicoController,
} from "../controllers/servicoController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";

// Exporta a função 'servicoRoutes'() para ser reutilizada em outras camadas.
export function servicoRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();
  // Registra rota HTTP POST '/cadastro' neste router; a requisição passará pelos middlewares/handler informados.
  router.post("/cadastro", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  // Registra rota HTTP POST '/' neste router; a requisição passará pelos middlewares/handler informados.
  router.post("/", authMiddleware, exigirPapel("admin"), cadastrarServicoController);
  // Registra rota HTTP PUT '/atualizar/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.put("/atualizar/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  // Registra rota HTTP PUT '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.put("/:id", authMiddleware, exigirPapel("admin"), atualizarServicoController);
  // Registra rota HTTP DELETE '/deletar/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.delete("/deletar/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);
  // Registra rota HTTP DELETE '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.delete("/:id", authMiddleware, exigirPapel("admin"), excluirServicoController);
  // Registra rota HTTP GET '/listar' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/listar", listarServicosController);
  // Registra rota HTTP GET '/' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/", listarServicosController);
  // Registra rota HTTP GET '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/:id", buscarServicoPorIdController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints HTTP de serviços, incluindo rotas públicas/admin conforme configuração.
