import { Router } from "express";
import {
  ativarClienteController,
  atualizarClienteController,
  buscarClienteController,
  cadastrarClienteController,
  excluirClienteController,
  listarClientesController,
} from "../controllers/clienteController";

// Exporta a função 'clienteRoutes'() para ser reutilizada em outras camadas.
export function clienteRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();

  // Executa: router.get(["/", "/listar"], listarClientesController);.
  router.get(["/", "/listar"], listarClientesController);
  // Executa: router.post(["/", "/cadastro"], cadastrarClienteController);.
  router.post(["/", "/cadastro"], cadastrarClienteController);
  // Registra rota HTTP GET '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/:id", buscarClienteController);
  // Registra rota HTTP PUT '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.put("/:id", atualizarClienteController);
  // Registra rota HTTP DELETE '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.delete("/:id", excluirClienteController);
  // Registra rota HTTP PATCH '/:id/ativar' neste router; a requisição passará pelos middlewares/handler informados.
  router.patch("/:id/ativar", ativarClienteController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints HTTP administrativos de clientes.
