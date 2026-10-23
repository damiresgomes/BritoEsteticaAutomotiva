import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthService } from "../services/authService";
import { UsuarioRepository } from "../repositories/usuarioRepository";
import { authMiddleware } from "../middlewares/authMiddleware";
import { limiteLoginMiddleware } from "../middlewares/limiteLoginMiddleware";

export function authRoutes(): Router {
  const router = Router();

  const usuarioRepository = new UsuarioRepository();
  const authService = new AuthService(usuarioRepository);
  const authController = new AuthController(authService);

  router.post("/login", limiteLoginMiddleware, (request, response) =>
    authController.login(request, response)
  );

  router.post("/logout", authMiddleware, (request, response) =>
    authController.logout(request, response)
  );

  router.get("/me", authMiddleware, (request, response) =>
    authController.perfil(request, response)
  );

  router.get("/teste", authMiddleware, (request, response) =>
    authController.teste(request, response)
  );

  return router;
}
