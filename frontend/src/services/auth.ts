import api from './api';
import { limparToken, limparTokens, lerToken, salvarToken } from "./authStorage";

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

export interface PerfilConta {
  id: number;
  usuarioId: number | null;
  nome: string;
  email: string;
  cpf: string | null;
  papel: "cliente" | "admin";
  salario: number | null;
  datanascimento: string | null;
}

export type PerfilAdmin = PerfilConta;

export type AtualizarPerfilAdmin = {
  nome: string;
  cpf: string;
  salario: number;
  datanascimento: string;
  senha?: string;
};

export interface CadastroCliente {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
}

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
    const rota = papelEsperado === "admin" ? "/auth/admin/login" : "/auth/login";
    const response = await api.post<AuthResponse>(rota, credentials);

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

    limparTokens();
    salvarToken(papel, response.data.token);
    return response.data;
  },

  async cadastrarCliente(dados: CadastroCliente): Promise<{ message: string; id: number }> {
    const response = await api.post<{ message: string; id: number }>(
      "/auth/cadastro-cliente",
      dados
    );
    return response.data;
  },

  async buscarPerfil(): Promise<PerfilConta> {
    const response = await api.get<PerfilConta>("/auth/me");
    return response.data;
  },

  async atualizarPerfilAdmin(dados: AtualizarPerfilAdmin): Promise<void> {
    await api.put("/auth/perfil-admin", dados);
  },

  logout(papel?: "cliente" | "admin"): void {
    if (papel) limparToken(papel);
    else limparTokens();
  },

  isAuthenticated(papel: "cliente" | "admin" = "cliente"): boolean {
    return Boolean(lerToken(papel));
  },

  getToken(papel: "cliente" | "admin" = "cliente"): string | null {
    return lerToken(papel);
  },
};