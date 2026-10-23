import { Router } from "express";
import { pool } from "../config/database";

export function healthRoutes(): Router {
  const router = Router();

  router.get("/", async (_request, response) => {
    try {
      await pool.query("SELECT 1");
      return response.status(200).json({ status: "ok" });
    } catch (erro) {
      console.error("Falha no health check:", erro);
      return response.status(503).json({ status: "indisponivel" });
    }
  });

  return router;
}
