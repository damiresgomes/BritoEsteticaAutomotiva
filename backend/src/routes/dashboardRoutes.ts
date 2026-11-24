import { Router } from "express";
import { dashboardUsuarioController, dashboardClienteController } from "../controllers/dashboardController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";

// Exporta a função 'dashboardRoutes'() para ser reutilizada em outras camadas.
export function dashboardRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();
  // Registra rota HTTP GET '/usuario' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/usuario", authMiddleware, exigirPapel("admin"), dashboardUsuarioController);

  // Registra rota HTTP GET '/cliente' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/cliente", clienteAuthMiddleware, dashboardClienteController);
  
  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints do dashboard administrativo.
