import { Router } from "express";
import { listarServicosPublicosController } from "../controllers/servicoController";

export function servicoPublicoRoutes() {
  const router = Router();

  router.get("/listar", listarServicosPublicosController);

  return router;
}