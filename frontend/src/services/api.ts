// Importa axios de 'axios'.
import axios from 'axios'
import { lerToken } from "./authStorage";

// Define função 'baseURL'.
const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:3333/api")
    // Chamada: .replace(":3000", ":3333").
    .replace(":3000", ":3333")
    // Chamada: .replace(/\/$/, "");.
    .replace(/\/$/, "");

// Declara constante 'api'.
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chamada: api.interceptors.request.use((config) => {.
api.interceptors.request.use((config) => {
  // Declara constante 'url'.
  const url = config.url ?? "";
  // Declara constante 'rotaPublica'.
  const rotaPublica =
    // Chamada: url.startsWith("/auth/login") ||.
    url.startsWith("/auth/login") ||
    // Chamada: url.startsWith("/auth/admin/login") ||.
    url.startsWith("/auth/admin/login") ||
    // Chamada: url.startsWith("/auth/cliente/login") ||.
    url.startsWith("/auth/cliente/login") ||
    // Chamada: url.startsWith("/admin/login") ||.
    url.startsWith("/admin/login") ||
    // Chamada: url.startsWith("/autenticacao/LoginAdministrativo") ||.
    url.startsWith("/autenticacao/LoginAdministrativo") ||
    // Chamada: url.startsWith("/autenticacao/LoginCliente") ||.
    url.startsWith("/autenticacao/LoginCliente") ||
    // Chamada: url.startsWith("/autenticacao/CadastrarCliente") ||.
    url.startsWith("/autenticacao/CadastrarCliente") ||
    // Chamada: url.startsWith("/auth/cadastro-cliente") ||.
    url.startsWith("/auth/cadastro-cliente") ||
    // Chamada: url.startsWith("/servicos/listar");.
    url.startsWith("/servicos/listar");
  // Declara constante 'tokenCliente'.
  const tokenCliente =
    // Chamada: url.startsWith("/auth/cliente/") ||.
    url.startsWith("/auth/cliente/") ||
    // Chamada: url.startsWith("/agendamentos/cliente/") ||.
    url.startsWith("/agendamentos/cliente/") ||
    // Chamada: url.startsWith("/agendamentos/horarios") ||.
    url.startsWith("/agendamentos/horarios") ||
    // Chamada: url.startsWith("/agendamentos/cadastro");.
    url.startsWith("/agendamentos/cadastro");
  // Declara constante 'token'.
  const token = rotaPublica ? null : lerToken(tokenCliente ? "cliente" : "admin");
  // Condição: token.
  if (token) {
    // Atribuição: config.headers.Authorization = `Bearer ${token}`;.
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Retorna config.
  return config;
});

export default api

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Configura base da API e utilitários de requisição/fetch usados pelos services do frontend.
