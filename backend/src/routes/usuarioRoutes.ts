import { Router } from "express";
import { cadastrarUsuarioController, listarUsuariosController, atualizarUsuarioController, buscarUsuarioPorIdController } from "../controllers/usuarioController";

export function usuarioRoutes(): Router {
  const router = Router();

  // Todas as rotas deste recurso são administrativas; o app exige papel admin.
  router.post("/cadastro", cadastrarUsuarioController);
  router.get("/listar", listarUsuariosController);
  router.get("/:id", buscarUsuarioPorIdController);
  router.get("/atualizar/:id", atualizarUsuarioController);
  router.put("/atualizar/:id", atualizarUsuarioController);

  return router;
}
