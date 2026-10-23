import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { UsuarioService } from "../services/usuarioService";
import { UsuarioRepository } from "../repositories/usuarioRepository";
import { authMiddleware } from "../middlewares/authMiddleware";

export function usuarioRoutes(): Router {
  const router = Router();

  const usuarioRepository = new UsuarioRepository();
  const usuarioService = new UsuarioService(usuarioRepository);
  const usuarioController = new UsuarioController(usuarioService);

  router.post("/cadastro", authMiddleware, (request, response) =>
    usuarioController.cadastrarUsuario(request, response)
  );

  router.get("/listar", authMiddleware, (request, response) =>
    usuarioController.listarUsuarios(request, response)
  );

  return router;
}
