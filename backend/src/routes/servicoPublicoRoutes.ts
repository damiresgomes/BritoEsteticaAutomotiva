import { Router } from "express";
import { listarServicosController } from "../controllers/servicoController";

export function servicoPublicoRoutes() {
  const router = Router();

  router.get("/listar", listarServicosController);

  return router;
}