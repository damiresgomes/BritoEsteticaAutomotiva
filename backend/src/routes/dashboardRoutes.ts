import { Router } from "express";
import { dashboardUsuarioController, dashboardClienteController } from "../controllers/dashboardController";
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";

export function dashboardRoutes(): Router {
  const router = Router();
  router.get("/usuario", authMiddleware, exigirPapel("admin"), dashboardUsuarioController);

  router.get("/cliente", clienteAuthMiddleware, dashboardClienteController);
  
  return router;
}