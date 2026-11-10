import { Router } from "express";
import {
  atualizarUsuarioController,
  buscarUsuarioPorIdController,
  cadastrarUsuarioController,
  desativarUsuarioController,
  listarUsuariosController,
} from "../controllers/usuarioController";

export function usuarioRoutes(): Router {
  const router = Router();

  router.post(["/", "/cadastro"], cadastrarUsuarioController);
  router.get(["/", "/listar"], listarUsuariosController);
  router.get("/:id", buscarUsuarioPorIdController);
  router.put(["/:id", "/atualizar/:id"], atualizarUsuarioController);
  router.delete(["/:id", "/desativar/:id"], desativarUsuarioController);

  return router;
}
