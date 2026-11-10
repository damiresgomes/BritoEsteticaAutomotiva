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
import { agendamentoRoutes } from "./routes/agendamentoRoutes";
import { categoriaRoutes } from "./routes/categoriaRoutes";
import { clienteRoutes } from "./routes/clienteRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";

export function buildApp() {
  const app = express();

  const origensPermitidas = env.CORS_ORIGINS.split(",")
    .map((origem) => origem.trim())
    .filter((origem) => origem.length > 0);

  app.set("trust proxy", env.TRUST_PROXY);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          origensPermitidas.includes(origin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed: " + origin));
      },
      credentials: true,
    })
  );

  app.use(morgan("dev"));
  app.use(express.json());

  app.use("/health", healthRoutes());

  app.use(["/api/auth", "/auth"], authRoutes());

  app.use(["/api/usuarios", "/usuarios"], authMiddleware, exigirPapel("admin"), usuarioRoutes());
  app.use(["/api/categorias", "/categorias"], authMiddleware, exigirPapel("admin"), categoriaRoutes());
  app.use(["/api/clientes", "/clientes"], authMiddleware, exigirPapel("admin"), clienteRoutes());

  app.use(["/api/servicos", "/servicos"], servicoRoutes());

  app.use(["/api/agendamentos", "/agendamentos"], agendamentoRoutes());

  app.use(["/api/dashboard", "/dashboard"], dashboardRoutes());

  app.use((_request, response) => {
    return response.status(404).json({ message: "Rota não encontrada" });
  });

  app.use(errorHandler);

  return app;
}
