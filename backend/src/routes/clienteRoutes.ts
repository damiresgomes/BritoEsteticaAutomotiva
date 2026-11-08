import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
    atualizarClienteController,
    buscarClientePorIdController,
    cadastrarClienteController,
    desativarClienteController,
    listarClientesController,
} from "../controllers/clienteController";

export function clienteRoutes(): Router {
    const router = Router();

    router.get("/", authMiddleware, listarClientesController);

    router.get("/:id", authMiddleware, buscarClientePorIdController);

    router.post("/", authMiddleware, cadastrarClienteController);

    router.put("/:id", authMiddleware, atualizarClienteController);
    
    router.delete("/:id", authMiddleware, desativarClienteController);

    return router;
}