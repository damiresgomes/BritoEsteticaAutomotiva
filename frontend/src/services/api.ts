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
    url.startsWith("/auth/cadastro-cliente") ||
    url.startsWith("/servicos/listar");
  const tokenCliente =
    url.startsWith("/agendamentos/horarios") ||
    url.startsWith("/agendamentos/cadastro");
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