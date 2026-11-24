// Importa Router do Express para declarar rotas de autenticação.
import { Router } from "express";
// Importa handlers de autenticação/admin/usuário.
import {
  cadastroCliente,
  login,
  loginAdmin,
  logout,
  perfil,
  atualizarPerfilAdmin,
  atualizarMeuUsuario,
  teste,
} from "../controllers/authController";
// Importa handlers específicos de autenticação/cadastro de cliente.
import {
  atualizarMeuCadastroClienteController,
  cadastrarClienteController,
  loginClienteController,
  logoutClienteController,
  perfilClienteController,
} from "../controllers/clienteAuthController";
// Middleware JWT para rotas autenticadas gerais/admin.
import { authMiddleware, exigirPapel } from "../middlewares/authMiddleware";
// Middleware JWT específico de cliente (tipo cliente).
import { clienteAuthMiddleware } from "../middlewares/clienteAuthMiddleware";
// Rate limit para proteger endpoints sensíveis contra brute force.
import { limiteLoginMiddleware } from "../middlewares/limiteLoginMiddleware";

// Monta e retorna o router de autenticação.
export function authRoutes(): Router {
  // Cria instância do router.
  const router = Router();

  // Cadastro público de cliente (alias moderno).
  router.post("/cadastro-cliente", limiteLoginMiddleware, cadastroCliente);
  // Alias legado de cadastro de cliente.
  router.post("/CadastrarCliente", limiteLoginMiddleware, cadastroCliente);
  // Login administrativo.
  router.post("/admin/login", limiteLoginMiddleware, loginAdmin);
  // Alias legado de login administrativo.
  router.post("/LoginAdministrativo", limiteLoginMiddleware, loginAdmin);
  // Login genérico (pode ser usado conforme fluxo existente).
  router.post("/login", limiteLoginMiddleware, login);
  // Logout de usuário autenticado; exige token válido.
  router.post("/logout", authMiddleware, logout);
  // Perfil do usuário autenticado.
  router.get("/me", authMiddleware, perfil);
  // Atualização de perfil administrativo; exige admin.
  router.put("/perfil-admin", authMiddleware, exigirPapel("admin"), atualizarPerfilAdmin);
  // Atualização do próprio usuário autenticado.
  router.put("/perfil-usuario", authMiddleware, atualizarMeuUsuario);
  // Rota de teste autenticada.
  router.get("/teste", authMiddleware, teste);

  // Cadastro de cliente por rota /cliente/cadastro.
  router.post("/cliente/cadastro", limiteLoginMiddleware, cadastrarClienteController);
  // Alias legado de cadastro de cliente.
  router.post("/cliente/CadastrarCliente", limiteLoginMiddleware, cadastrarClienteController);
  // Login de cliente.
  router.post("/cliente/login", limiteLoginMiddleware, loginClienteController);
  // Alias legado de login de cliente.
  router.post("/LoginCliente", limiteLoginMiddleware, loginClienteController);
  // Logout de cliente autenticado.
  router.post("/cliente/logout", clienteAuthMiddleware, logoutClienteController);
  // Perfil do cliente autenticado.
  router.get("/cliente/me", clienteAuthMiddleware, perfilClienteController);
  // Atualização do cadastro do próprio cliente.
  router.put("/cliente/me", clienteAuthMiddleware, atualizarMeuCadastroClienteController);

  // Retorna router pronto para ser montado em app.ts.
  return router;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: mapear endpoints de autenticação e perfil.
// - Compatibilidade: mantém aliases legados (/LoginAdministrativo, /CadastrarCliente etc.).
// - Segurança: rate limit em login/cadastro; authMiddleware/clienteAuthMiddleware nas rotas protegidas; exigirPapel admin no perfil admin.
// - Contratos: `/auth/admin/login` emite token admin; `/auth/cliente/login` emite token tipo cliente; `/me` e `/cliente/me` retornam perfis.
