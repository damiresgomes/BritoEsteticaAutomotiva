import { Router } from "express";
import { cadastroCliente, login, logout, perfil, teste } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { limiteLoginMiddleware } from "../middlewares/limiteLoginMiddleware";

export function authRoutes(): Router {
  const router = Router();

  router.post("/cadastro-cliente", cadastroCliente);
  router.post("/login", limiteLoginMiddleware, login);
  router.post("/logout", authMiddleware, logout);
  router.get("/me", authMiddleware, perfil);
  router.get("/teste", authMiddleware, teste);

  return router;
}