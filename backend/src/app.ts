import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRoutes } from "./routes/authRoutes";
import { usuarioRoutes } from "./routes/usuarioRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { servicoRoutes } from "./routes/servicoRoutes";
import { authMiddleware, exigirPapel } from "./middlewares/authMiddleware";
import { healthRoutes } from "./routes/healthRoutes";
import { env } from "./config/env";
import { servicoPublicoRoutes } from "./routes/servicoPublicoRoutes";
import { agendamentoRoutes } from "./routes/agendamentoRoutes";

export function buildApp() {
  const app = express();

  const origensPermitidas = env.CORS_ORIGINS.split(",")
    .map((origem) => origem.trim())
    .filter((origem) => origem.length > 0);

  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(cors({ origin: origensPermitidas, credentials: false }));
  app.use(morgan("dev"));
  app.use(express.json());

  app.use("/health", healthRoutes());

  app.use("/api/auth", authRoutes());

  app.use("/api/usuarios", authMiddleware, exigirPapel("admin"), usuarioRoutes());

  // Público (o site usa sem login): precisa vir antes da rota protegida.
  app.use("/api/servicos", servicoPublicoRoutes());

  app.use("/api/servicos", authMiddleware, exigirPapel("admin"), servicoRoutes());

  app.use("/api/agendamentos", agendamentoRoutes());

  app.use((_request, response) => {
    return response.status(404).json({ message: "Rota não encontrada" });
  });

  app.use(errorHandler);

  return app;
}
