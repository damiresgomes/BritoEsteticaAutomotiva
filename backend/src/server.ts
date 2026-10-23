import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

async function encerrar(servidor: ReturnType<ReturnType<typeof buildApp>["listen"]>, sinal: string): Promise<void> {
  console.log(`${sinal} recebido, encerrando com segurança...`);

  await new Promise<void>((resolve) => {
    servidor.close(() => resolve());
  });

  await pool.end();
  process.exit(0);
}

async function iniciar(): Promise<void> {
  await pool.query("SELECT 1");
  console.log("Conexão com o banco de dados confirmada");

  const app = buildApp();

  const servidor = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${env.PORT}`);
  });

  servidor.on("error", (erro) => {
    console.error(erro);
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    void encerrar(servidor, "SIGTERM");
  });

  process.on("SIGINT", () => {
    void encerrar(servidor, "SIGINT");
  });
}

process.on("unhandledRejection", (motivo) => {
  console.error("Promise rejeitada sem tratamento:", motivo);
});

process.on("uncaughtException", (erro) => {
  console.error("Exceção não capturada:", erro);
  process.exit(1);
});

iniciar().catch((erro: unknown) => {
  console.error("Não foi possível iniciar o servidor. O banco de dados está no ar e o .env está correto?");
  console.error(erro);
  process.exit(1);
});
