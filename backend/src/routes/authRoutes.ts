import { Router } from "express";
import {
  cadastroCliente,
  login,
  loginAdmin,
  logout,
  perfil,
  atualizarPerfilAdmin,
  teste,
} from "../controllers/authController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";
import { limiteLoginMiddleware } from "../middlewares/limiteLoginMiddleware";

export function authRoutes(): Router {
  const router = Router();

  router.post("/cadastro-cliente", cadastroCliente);
  router.post("/admin/login", limiteLoginMiddleware, loginAdmin);
  router.post("/login", limiteLoginMiddleware, login);
  router.post("/logout", authMiddleware, logout);
  router.get("/me", authMiddleware, perfil);
  router.put("/perfil-admin", authMiddleware, exigirPapel("admin"), atualizarPerfilAdmin);
  router.get("/teste", authMiddleware, teste);

  return router;
}