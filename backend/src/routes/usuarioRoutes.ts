import { Router } from "express";
import {
  atualizarUsuarioController,
  buscarUsuarioPorIdController,
  cadastrarUsuarioController,
  desativarUsuarioController,
  listarUsuariosController,
} from "../controllers/usuarioController";
import { exigirPapel } from "../middlewares/authMiddleware";

export function usuarioRoutes(): Router {
  const router = Router();

  router.post(["/", "/cadastro"], exigirPapel("admin"), cadastrarUsuarioController);
  router.get(["/", "/listar"], exigirPapel("admin"), listarUsuariosController);
  router.get("/:id", exigirPapel("admin"), buscarUsuarioPorIdController);
  router.put(["/:id", "/atualizar/:id"], atualizarUsuarioController);
  router.delete(["/:id", "/desativar/:id"], exigirPapel("admin"), desativarUsuarioController);

  return router;
}
