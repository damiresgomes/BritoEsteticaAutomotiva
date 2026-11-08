import { Router } from "express";
import { login, logout, perfil } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { limiteLoginMiddleware } from "../middlewares/limiteLoginMiddleware";
import { atualizarMeuCadastroClienteController, cadastrarClienteController, loginClienteController, logoutClienteController, perfilClienteController } from "../controllers/clienteAuthController";
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";

export function authRoutes(): Router {
  const router = Router();

  router.post("/usuario/login", limiteLoginMiddleware, login);

  router.post("/login", limiteLoginMiddleware, login);

  router.post("/cliente/cadastro", cadastrarClienteController);

  router.post("/cliente/login", limiteLoginMiddleware, loginClienteController);

  router.post("/cliente/logout", clienteAuthMiddleware, logoutClienteController);

  router.get("/cliente/me", clienteAuthMiddleware, perfilClienteController);

  router.put("/cliente/me", clienteAuthMiddleware, atualizarMeuCadastroClienteController);

  router.post("/logout", authMiddleware, logout);
  
  router.get("/me", authMiddleware, perfil);

  return router;
}
