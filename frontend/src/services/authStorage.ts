export type AuthRole = "cliente" | "admin";

const TOKEN_KEYS: Record<AuthRole, string> = {
  cliente: "brito-client-token",
  admin: "brito-admin-token",
};

function migrarTokenAntigo(papel: AuthRole): string | null {
  const chave = TOKEN_KEYS[papel];
  const tokenAntigo = sessionStorage.getItem(chave);
  if (!tokenAntigo) return null;

  localStorage.setItem(chave, tokenAntigo);
  sessionStorage.removeItem(chave);
  return tokenAntigo;
}

export function lerToken(papel: AuthRole): string | null {
  return localStorage.getItem(TOKEN_KEYS[papel]) ?? migrarTokenAntigo(papel);
}

export function salvarToken(papel: AuthRole, token: string): void {
  localStorage.setItem(TOKEN_KEYS[papel], token);
  sessionStorage.removeItem(TOKEN_KEYS[papel]);
}

export function limparToken(papel: AuthRole): void {
  localStorage.removeItem(TOKEN_KEYS[papel]);
  sessionStorage.removeItem(TOKEN_KEYS[papel]);
}

export function limparTokens(): void {
  limparToken("cliente");
  limparToken("admin");
}
