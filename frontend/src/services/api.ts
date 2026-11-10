import axios from 'axios'
import { lerToken } from "./authStorage";

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(":3000", ":3333"),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const rotaPublica =
    url.startsWith("/auth/login") ||
    url.startsWith("/auth/admin/login") ||
    url.startsWith("/auth/cadastro-cliente") ||
    url.startsWith("/servicos/listar");
  const tokenCliente =
    url.startsWith("/agendamentos/horarios") ||
    url.startsWith("/agendamentos/cadastro");
  const token = rotaPublica ? null : lerToken(tokenCliente ? "cliente" : "admin");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api