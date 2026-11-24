// Define e exporta o tipo 'AuthRole'.
export type AuthRole = "cliente" | "admin";

const TOKEN_KEYS: Record<AuthRole, string> = {
  cliente: "brito-client-token",
  admin: "brito-admin-token",
};

function migrarTokenAntigo(papel: AuthRole): string | null {
  // Declara constante 'chave'.
  const chave = TOKEN_KEYS[papel];
  // Declara constante 'tokenAntigo'.
  const tokenAntigo = sessionStorage.getItem(chave);
  if (!tokenAntigo) return null;

  // Chamada: localStorage.setItem(chave, tokenAntigo);.
  localStorage.setItem(chave, tokenAntigo);
  // Chamada: sessionStorage.removeItem(chave);.
  sessionStorage.removeItem(chave);
  // Retorna tokenAntigo.
  return tokenAntigo;
}

// Exporta a função/componente 'lerToken' para uso em rotas ou outros componentes.
export function lerToken(papel: AuthRole): string | null {
  // Retorna localStorage.getItem(TOKEN_KEYS[papel]) ?? migrarTokenAntigo(papel).
  return localStorage.getItem(TOKEN_KEYS[papel]) ?? migrarTokenAntigo(papel);
}

// Exporta a função/componente 'salvarToken' para uso em rotas ou outros componentes.
export function salvarToken(papel: AuthRole, token: string): void {
  // Chamada: localStorage.setItem(TOKEN_KEYS[papel], token);.
  localStorage.setItem(TOKEN_KEYS[papel], token);
  // Chamada: sessionStorage.removeItem(TOKEN_KEYS[papel]);.
  sessionStorage.removeItem(TOKEN_KEYS[papel]);
}

// Exporta a função/componente 'limparToken' para uso em rotas ou outros componentes.
export function limparToken(papel: AuthRole): void {
  // Chamada: localStorage.removeItem(TOKEN_KEYS[papel]);.
  localStorage.removeItem(TOKEN_KEYS[papel]);
  // Chamada: sessionStorage.removeItem(TOKEN_KEYS[papel]);.
  sessionStorage.removeItem(TOKEN_KEYS[papel]);
}

// Exporta a função/componente 'limparTokens' para uso em rotas ou outros componentes.
export function limparTokens(): void {
  // Chamada: limparToken("cliente");.
  limparToken("cliente");
  // Chamada: limparToken("admin");.
  limparToken("admin");
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Gerencia tokens de autenticação no localStorage e eventos de sessão.
