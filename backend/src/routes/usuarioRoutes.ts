import { Router } from "express";
import { cadastrarUsuarioController, listarUsuariosController, atualizarUsuarioController, buscarUsuarioPorIdController, desativarUsuarioController } from "../controllers/usuarioController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function usuarioRoutes(): Router {
  const router = Router();

  router.post("/cadastro", authMiddleware, cadastrarUsuarioController);

  router.get("/listar", authMiddleware, listarUsuariosController);

  router.get("/:id", authMiddleware, buscarUsuarioPorIdController);

  router.put("/atualizar/:id", authMiddleware, atualizarUsuarioController);
  
  router.delete("/desativar/:id", authMiddleware, desativarUsuarioController);

  return router;
}
