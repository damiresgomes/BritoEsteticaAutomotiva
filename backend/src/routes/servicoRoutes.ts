import { Router } from "express";
import { ServicoController } from "../controllers/servicoController";
import { ServicoRepository } from "../repositories/servicoRepository";
import { ServicoService } from "../services/servicoService";


export function servicoRoutes(): Router {
  const router = Router();

  const servicoRepository = new ServicoRepository();
  const servicoService = new ServicoService(servicoRepository);
  const servicoController = new ServicoController(servicoService);

  router.post("/cadastro", (request, response) => servicoController.cadastrarServico(request, response));

  router.get("/listar", (request, response) => servicoController.listarServicos(request, response));

  return router;
}