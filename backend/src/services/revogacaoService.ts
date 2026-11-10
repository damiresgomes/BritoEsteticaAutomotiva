const tokensExpirados = new Map<string, number>();

export function expirarToken(jti: string, expiraEmSegundos: number): void {
    limparTokensExpirados();
    tokensExpirados.set(jti, Date.now() + expiraEmSegundos * 1000);
}

export function tokenExpirado(jti: string): boolean {
    const expiraEm = tokensExpirados.get(jti);

    if (!expiraEm) {
        return false;
    }

    if (expiraEm <= Date.now()) {
        tokensExpirados.delete(jti);
        return false;
    }

    return true;
}

export function limparTokensExpirados(): void {
    const agora = Date.now();

    for (const [jti, expiraEm] of tokensExpirados) {
        if (expiraEm <= agora) {
            tokensExpirados.delete(jti);
        }
    }
}
