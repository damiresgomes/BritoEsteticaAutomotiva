import { Router } from "express";
import {
  atualizarUsuarioController,
  buscarUsuarioPorIdController,
  cadastrarUsuarioController,
  desativarUsuarioController,
  listarUsuariosController,
} from "../controllers/usuarioController";
import { exigirPapel } from "../middlewares/authMiddleware";

// Exporta a função 'usuarioRoutes'() para ser reutilizada em outras camadas.
export function usuarioRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();

  // Executa: router.post(["/", "/cadastro"], exigirPapel("admin"), cadastrarUsuarioController);.
  router.post(["/", "/cadastro"], exigirPapel("admin"), cadastrarUsuarioController);
  // Executa: router.get(["/", "/listar"], exigirPapel("admin"), listarUsuariosController);.
  router.get(["/", "/listar"], exigirPapel("admin"), listarUsuariosController);
  // Registra rota HTTP GET '/:id' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/:id", exigirPapel("admin"), buscarUsuarioPorIdController);
  // Executa: router.put(["/:id", "/atualizar/:id"], atualizarUsuarioController);.
  router.put(["/:id", "/atualizar/:id"], atualizarUsuarioController);
  // Executa: router.delete(["/:id", "/desativar/:id"], exigirPapel("admin"), desativarUsuarioController);.
  router.delete(["/:id", "/desativar/:id"], exigirPapel("admin"), desativarUsuarioController);

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoints HTTP de usuários e aplica middlewares de autenticação/autorização.
