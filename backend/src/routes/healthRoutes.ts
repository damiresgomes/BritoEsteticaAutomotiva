import { Router } from "express";
import { pool } from "../config/database";

// Exporta a função 'healthRoutes'() para ser reutilizada em outras camadas.
export function healthRoutes(): Router {
  // Cria a constante local 'router'; usar const evita reatribuição acidental.
  const router = Router();

  // Registra rota HTTP GET '/' neste router; a requisição passará pelos middlewares/handler informados.
  router.get("/", async (_request, response) => {
    // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
    try {
      // Executa consulta SQL no pool MySQL.
      await pool.query("SELECT 1");
      // Envia resposta HTTP ao cliente: response.status(200).json({ status: "ok" }).
      return response.status(200).json({ status: "ok" });
    } catch (erro) {
      // Executa: console.error("Falha no health check:", erro);.
      console.error("Falha no health check:", erro);
      // Envia resposta HTTP ao cliente: response.status(503).json({ status: "indisponivel" }).
      return response.status(503).json({ status: "indisponivel" });
    }
  });

  // Retorna router para quem chamou esta função.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Define endpoint de health check usado por monitoramento/Docker.
