// Importa api de './api'.
import api from './api';
import { limparToken, limparTokens, lerToken, salvarToken } from "./authStorage";

// Define e exporta a interface 'LoginCredentials' para tipagem.
export interface LoginCredentials {
  senha: string;
  email: string;
}

// Define e exporta a interface 'AuthResponse' para tipagem.
export interface AuthResponse {
  token: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    papel?: "cliente" | "admin";
  };
}

// Define e exporta a interface 'PerfilConta' para tipagem.
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

// Define e exporta o tipo 'PerfilAdmin'.
export type PerfilAdmin = PerfilConta;

// Define e exporta a interface 'PerfilCliente' para tipagem.
export interface PerfilCliente {
  id_cliente: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string | null;
  ativo: string;
}

// Define e exporta o tipo 'AtualizarPerfilAdmin'.
export type AtualizarPerfilAdmin = {
  nome: string;
  cpf: string;
  salario: number;
  datanascimento: string;
  senha?: string;
};

// Define e exporta o tipo 'AtualizarPerfilCliente'.
export type AtualizarPerfilCliente = {
  nome: string;
  cpf: string;
  telefone: string;
  senha?: string;
};

// Define e exporta a interface 'CadastroCliente' para tipagem.
export interface CadastroCliente {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
}

function obterPapelDaResposta(resposta: AuthResponse): "cliente" | "admin" | null {
  if (resposta.usuario?.papel) return resposta.usuario.papel;

  // Bloco try: captura erros de chamadas assíncronas/rede/validação.
  try {
    // Declara constante 'partePayload'.
    const partePayload = resposta.token.split(".")[1];
    if (!partePayload) return null;
    // Declara constante 'base64'.
    const base64 = partePayload.replace(/-/g, "+").replace(/_/g, "/");
    // Declara constante 'payload'.
    const payload = JSON.parse(
      // Chamada: atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")).
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
    ) as { papel?: unknown; tipo?: unknown };

    if (payload.papel === "cliente" || payload.tipo === "cliente") return "cliente";
    if (payload.papel === "admin") return "admin";
    // Retorna null.
    return null;
  } catch {
    // Retorna null.
    return null;
  }
}

// Exporta a constante 'authService'.
export const authService = {
  async login(
    credentials: LoginCredentials,
    papelEsperado: "cliente" | "admin"
  ): Promise<AuthResponse> {
    // Declara constante 'rota'.
    const rota = papelEsperado === "admin" ? "/autenticacao/LoginAdministrativo" : "/autenticacao/LoginCliente";
    // Declara constante 'response'.
    const response = await api.post<AuthResponse>(rota, credentials);

    // Condição: !response.data.token.
    if (!response.data.token) {
      // Lança erro: new Error("O servidor não retornou um token de acesso.");.
      throw new Error("O servidor não retornou um token de acesso.");
    }

    // Declara constante 'papel'.
    const papel = obterPapelDaResposta(response.data);
    // Condição: papel !== papelEsperado.
    if (papel !== papelEsperado) {
      // Lança erro: new Error(.
      throw new Error(
        // Atribuição: papel === "admin".
        papel === "admin"
          ? "Esta conta administrativa não pode ser usada para agendar como cliente."
          : papel === "cliente"
            ? "Esta conta não tem permissão para acessar o painel administrativo."
            : "Não foi possível confirmar o tipo de conta retornado pelo servidor."
      );
    }

    // Chamada: limparToken(papel);.
    limparToken(papel);
    // Chamada: salvarToken(papel, response.data.token);.
    salvarToken(papel, response.data.token);
    // Chamada: window.dispatchEvent(new Event("brito:sessao"));.
    window.dispatchEvent(new Event("brito:sessao"));
    // Retorna response.data.
    return response.data;
  },

  async cadastrarCliente(dados: CadastroCliente): Promise<{ message: string; id: number }> {
    // Declara constante 'response'.
    const response = await api.post<{ message: string; id: number }>(
      "/autenticacao/CadastrarCliente",
      dados
    );
    // Retorna response.data.
    return response.data;
  },

  async buscarPerfil(): Promise<PerfilConta> {
    // Declara constante 'response'.
    const response = await api.get<PerfilConta>("/auth/me");
    // Retorna response.data.
    return response.data;
  },

  async buscarPerfilCliente(): Promise<PerfilCliente> {
    // Declara constante 'response'.
    const response = await api.get<PerfilCliente>("/auth/cliente/me");
    // Retorna response.data.
    return response.data;
  },

  async atualizarPerfilAdmin(dados: AtualizarPerfilAdmin): Promise<void> {
    // Aguarda operação assíncrona: api.put("/auth/perfil-admin", dados);.
    await api.put("/auth/perfil-admin", dados);
  },

  async atualizarPerfilCliente(dados: AtualizarPerfilCliente): Promise<void> {
    // Aguarda operação assíncrona: api.put("/auth/cliente/me", dados);.
    await api.put("/auth/cliente/me", dados);
  },

  // Chamada: logout(papel?: "cliente" | "admin"): void {.
  logout(papel?: "cliente" | "admin"): void {
    if (papel) limparToken(papel);
    // Caminho alternativo quando condições anteriores não são atendidas.
    else limparTokens();
    // Chamada: window.dispatchEvent(new Event("brito:sessao"));.
    window.dispatchEvent(new Event("brito:sessao"));
  },

  async logoutAdmin(): Promise<void> {
    // Aguarda operação assíncrona: api.post("/auth/logout").catch(() => undefined);.
    await api.post("/auth/logout").catch(() => undefined);
    // Chamada: this.logout("admin");.
    this.logout("admin");
  },

  async logoutCliente(): Promise<void> {
    // Aguarda operação assíncrona: api.post("/auth/cliente/logout").catch(() => undefined);.
    await api.post("/auth/cliente/logout").catch(() => undefined);
    // Chamada: this.logout("cliente");.
    this.logout("cliente");
  },

  // Chamada: isAuthenticated(papel: "cliente" | "admin" = "cliente"): boolean {.
  isAuthenticated(papel: "cliente" | "admin" = "cliente"): boolean {
    // Retorna Boolean(lerToken(papel)).
    return Boolean(lerToken(papel));
  },

  // Chamada: getToken(papel: "cliente" | "admin" = "cliente"): string | null {.
  getToken(papel: "cliente" | "admin" = "cliente"): string | null {
    // Retorna lerToken(papel).
    return lerToken(papel);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend de autenticação: login/logout/perfil/cadastro e integração com tokens.
