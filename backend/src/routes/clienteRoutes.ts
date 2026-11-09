import { Router } from "express";
import {
  ativarClienteController,
  atualizarClienteController,
  buscarClienteController,
  cadastrarClienteController,
  excluirClienteController,
  listarClientesController,
} from "../controllers/clienteController";

export function clienteRoutes(): Router {
  const router = Router();

  router.get("/listar", listarClientesController);
  router.post("/cadastro", cadastrarClienteController);
  router.get("/:id", buscarClienteController);
  router.put("/:id", atualizarClienteController);
  router.delete("/:id", excluirClienteController);
  router.patch("/:id/ativar", ativarClienteController);

  return router;
}
