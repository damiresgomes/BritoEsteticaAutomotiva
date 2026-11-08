import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
    atualizarCategoriaController,
    buscarCategoriaController,
    cadastrarCategoriaController,
    excluirCategoriaController,
    listarCategoriasController,
} from "../controllers/categoriaController";

export function categoriaRoutes(): Router {
    const router = Router();

    router.get("/", listarCategoriasController);

    router.get("/:id", buscarCategoriaController);

    router.post("/", authMiddleware, cadastrarCategoriaController);

    router.put("/:id", authMiddleware, atualizarCategoriaController);
    
    router.delete("/:id", authMiddleware, excluirCategoriaController);

    return router;
}
