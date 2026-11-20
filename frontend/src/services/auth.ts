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

export interface PerfilCliente {
  id_cliente: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string | null;
  ativo: string;
}

export type AtualizarPerfilAdmin = {
  nome: string;
  cpf: string;
  salario: number;
  datanascimento: string;
  senha?: string;
};

export type AtualizarPerfilCliente = {
  nome: string;
  cpf: string;
  telefone: string;
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
    ) as { papel?: unknown; tipo?: unknown };

    if (payload.papel === "cliente" || payload.tipo === "cliente") return "cliente";
    if (payload.papel === "admin") return "admin";
    return null;
  } catch {
    return null;
  }
}

export const authService = {
  async login(
    credentials: LoginCredentials,
    papelEsperado: "cliente" | "admin"
  ): Promise<AuthResponse> {
    const rota = papelEsperado === "admin" ? "/auth/admin/login" : "/auth/cliente/login";
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

    limparToken(papel);
    salvarToken(papel, response.data.token);
    window.dispatchEvent(new Event("brito:sessao"));
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

  async buscarPerfilCliente(): Promise<PerfilCliente> {
    const response = await api.get<PerfilCliente>("/auth/cliente/me");
    return response.data;
  },

  async atualizarPerfilAdmin(dados: AtualizarPerfilAdmin): Promise<void> {
    await api.put("/auth/perfil-admin", dados);
  },

  async atualizarPerfilCliente(dados: AtualizarPerfilCliente): Promise<void> {
    await api.put("/auth/cliente/me", dados);
  },

  logout(papel?: "cliente" | "admin"): void {
    if (papel) limparToken(papel);
    else limparTokens();
    window.dispatchEvent(new Event("brito:sessao"));
  },

  async logoutCliente(): Promise<void> {
    await api.post("/auth/cliente/logout").catch(() => undefined);
    this.logout("cliente");
  },

  isAuthenticated(papel: "cliente" | "admin" = "cliente"): boolean {
    return Boolean(lerToken(papel));
  },

  getToken(papel: "cliente" | "admin" = "cliente"): string | null {
    return lerToken(papel);
  },
};