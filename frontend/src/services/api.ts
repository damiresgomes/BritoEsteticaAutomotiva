import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const rotaPublica =
    url.startsWith("/auth/login") ||
    url.startsWith("/auth/cliente/login") ||
    url.startsWith("/auth/cliente/cadastro") ||
    url.startsWith("/servicos/listar") ||
    url.startsWith("/agendamentos/horarios");
  const tokenCliente =
    url.startsWith("/agendamentos/cliente") ||
    url.startsWith("/auth/cliente/me") ||
    url.startsWith("/auth/cliente/logout");
  const token = rotaPublica
    ? null
    : sessionStorage.getItem(
        tokenCliente ? "brito-client-token" : "brito-admin-token"
      );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api