import { Server } from "http";
import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

function encerrar(servidor: Server): void {
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

async function iniciar(): Promise<void> {
  await pool.query("SELECT 1");

  const servidor = buildApp().listen(env.PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${env.PORT}`);
  });

  for (const sinal of ["SIGTERM", "SIGINT"] as const) {
    process.on(sinal, () => encerrar(servidor));
  }
}

iniciar().catch((erro: unknown) => {
  console.error("Não foi possível iniciar o servidor. O banco está no ar e o .env está correto?", erro);
  process.exit(1);
});