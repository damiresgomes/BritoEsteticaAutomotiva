import api from './api';

export interface LoginCredentials {
  senha: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    papel?: "cliente" | "admin";
  };
}

export interface CadastroCliente {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

const CHAVE_TOKEN_CLIENTE = "brito-client-token";
const CHAVE_TOKEN_ADMIN = "brito-admin-token";

function obterPapelDaResposta(resposta: AuthResponse): "cliente" | "admin" | null {
  if (resposta.usuario?.papel) return resposta.usuario.papel;

  try {
    const partePayload = resposta.token.split(".")[1];
    if (!partePayload) return null;
    const base64 = partePayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
    ) as { papel?: unknown };

    return payload.papel === "cliente" || payload.papel === "admin"
      ? payload.papel
      : null;
  } catch {
    return null;
  }
}

export const authService = {
  async login(
    credentials: LoginCredentials,
    papelEsperado: "cliente" | "admin"
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    if (!response.data.token) {
      throw new Error("O servidor não retornou um token de acesso.");
    }

    const papel = obterPapelDaResposta(response.data);
    if (papel !== papelEsperado) {
      throw new Error(
        papel === "admin"
          ? "Esta conta administrativa não pode ser usada para agendar como cliente."
          : papel === "cliente"
            ? "Esta conta não tem permissão para acessar o painel administrativo."
            : "Não foi possível confirmar o tipo de conta retornado pelo servidor."
      );
    }

    sessionStorage.removeItem(CHAVE_TOKEN_CLIENTE);
    sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
    sessionStorage.setItem(
      papel === "cliente" ? CHAVE_TOKEN_CLIENTE : CHAVE_TOKEN_ADMIN,
      response.data.token
    );
    return response.data;
  },

  async cadastrarCliente(dados: CadastroCliente): Promise<{ message: string; id: number }> {
    const response = await api.post<{ message: string; id: number }>(
      "/auth/cadastro-cliente",
      dados
    );
    return response.data;
  },

  logout(papel?: "cliente" | "admin"): void {
    if (!papel || papel === "cliente") {
      sessionStorage.removeItem(CHAVE_TOKEN_CLIENTE);
    }
    if (!papel || papel === "admin") {
      sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
    }
  },

  isAuthenticated(papel: "cliente" | "admin" = "cliente"): boolean {
    return Boolean(
      sessionStorage.getItem(
        papel === "cliente" ? CHAVE_TOKEN_CLIENTE : CHAVE_TOKEN_ADMIN
      )
    );
  },

  getToken(papel: "cliente" | "admin" = "cliente"): string | null {
    return sessionStorage.getItem(
      papel === "cliente" ? CHAVE_TOKEN_CLIENTE : CHAVE_TOKEN_ADMIN
    );
  },
};