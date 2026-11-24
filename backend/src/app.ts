// Importa o framework Express para criar o servidor HTTP e definir rotas/middlewares.
import express from "express";
// Importa o middleware CORS para controlar quais origens podem chamar a API.
import cors from "cors";
// Importa o Helmet para adicionar cabeçalhos HTTP de segurança.
import helmet from "helmet";
// Importa o Morgan para registrar logs das requisições HTTP no terminal.
import morgan from "morgan";
// Importa as rotas de autenticação (login, cadastro, perfil, logout etc.).
import { authRoutes } from "./routes/authRoutes";
// Importa as rotas de usuários administrativos.
import { usuarioRoutes } from "./routes/usuarioRoutes";
// Importa o middleware central de tratamento de erros.
import { errorHandler } from "./middlewares/errorHandler";
// Importa as rotas de serviços (públicas e administrativas, conforme definição interna).
import { servicoRoutes } from "./routes/servicoRoutes";
// Importa middleware de autenticação JWT e guard de papel/permissão.
import { authMiddleware, exigirPapel } from "./middlewares/authMiddleware";
// Importa rotas de health check para monitoramento/disponibilidade.
import { healthRoutes } from "./routes/healthRoutes";
// Importa variáveis de ambiente já validadas.
import { env } from "./config/env";
// Importa rotas de agendamentos.
import { agendamentoRoutes } from "./routes/agendamentoRoutes";
// Importa rotas de categorias.
import { categoriaRoutes } from "./routes/categoriaRoutes";
// Importa rotas de clientes.
import { clienteRoutes } from "./routes/clienteRoutes";
// Importa rotas do dashboard administrativo.
import { dashboardRoutes } from "./routes/dashboardRoutes";

// Função que monta e configura a aplicação Express, sem iniciar o listen.
export function buildApp() {
  // Cria a instância principal do app Express.
  const app = express();

  // Lê CORS_ORIGINS do ambiente, separa por vírgula, remove espaços e ignora entradas vazias.
  const origensPermitidas = env.CORS_ORIGINS.split(",")
    .map((origem) => origem.trim())
    .filter((origem) => origem.length > 0);

  // Configura trust proxy para Express respeitar IP/protocolo enviados pelo Nginx/proxy.
  app.set("trust proxy", env.TRUST_PROXY);

  // Aplica Helmet para cabeçalhos de segurança; permite recursos cross-origin quando necessário.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // Aplica CORS com validação dinâmica da origem da requisição.
  app.use(
    cors({
      // Função que decide se a origem recebida pode acessar a API.
      origin: (origin, callback) => {
        // Permite requisições sem origin (ex.: curl, healthchecks internos) ou origens explicitamente permitidas.
        if (
          !origin ||
          origensPermitidas.includes(origin) ||
          // Também permite localhost/127.0.0.1 em qualquer porta para desenvolvimento local.
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          // Origem aceita.
          return callback(null, true);
        }
        // Origem não permitida: retorna erro de CORS.
        return callback(new Error("Origem nǜo permitida pelo CORS: " + origin));
      },
      // Permite envio de credenciais/cookies quando necessário.
      credentials: true,
    })
  );

  // Registra requisições no formato "dev" para facilitar depuração.
  app.use(morgan("dev"));
  // Habilita parsing de JSON no body das requisições.
  app.use(express.json());

  // Registra rotas de health check com e sem prefixo /api.
  app.use(["/health", "/api/health"], healthRoutes());

  // Registra rotas de autenticação, mantendo aliases legados para compatibilidade.
  app.use(["/api/auth", "/auth", "/api/autenticacao", "/autenticacao"], authRoutes());

  // Rotas de usuários: exigem token válido; regras específicas de papel podem existir dentro das rotas/controllers.
  app.use(["/api/usuarios", "/usuarios"], authMiddleware, usuarioRoutes());
  // Rotas de categorias: exigem autenticação e papel admin.
  app.use(["/api/categorias", "/categorias"], authMiddleware, exigirPapel("admin"), categoriaRoutes());
  // Rotas de clientes: exigem autenticação e papel admin.
  app.use(["/api/clientes", "/clientes"], authMiddleware, exigirPapel("admin"), clienteRoutes());

  // Rotas de serviços; podem conter endpoints públicos e protegidos internamente.
  app.use(["/api/servicos", "/servicos"], servicoRoutes());

  // Rotas de agendamentos; proteção pode variar por endpoint.
  app.use(["/api/agendamentos", "/agendamentos"], agendamentoRoutes());

  // Rotas de dashboard administrativo.
  app.use(["/api/dashboard", "/dashboard"], dashboardRoutes());

  // Middleware final para rotas não encontradas: retorna 404 em JSON.
  app.use((_request, response) => {
    return response.status(404).json({ message: "Rota nǜo encontrada" });
  });

  // Middleware de erro central: converte exceções em respostas HTTP padronizadas.
  app.use(errorHandler);

  // Retorna o app configurado para ser usado por server.ts ou testes.
  return app;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: centralizar a configuração do Express (composition root HTTP).
// - Entrada: variáveis de ambiente via `env` e requisições HTTP.
// - Saída: app Express pronto para `listen`.
// - Segurança: Helmet, CORS com whitelist + localhost em dev, trust proxy configurável.
// - Contrato: registra rotas com aliases legados (`/api/*` e sem prefixo) para não quebrar frontend antigo.
// - Erros: rota desconhecida retorna 404 JSON; `errorHandler` padroniza exceções.
