import { Router } from "express";
import { listarServicosController } from "../controllers/servicoController";

// Exporta a função 'servicoPublicoRoutes'() para ser reutilizada em outras camadas.
export function servicoPublicoRoutes() {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();

  // Registra rota HTTP GET '/listar' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/listar", listarServicosController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints públicos de serviços para consumo pelo site.
