const tokensRevogados = new Map<string, number>();

export function revogarToken(jti: string, expiraEmSegundos: number): void {
    limparTokensExpirados();
    tokensRevogados.set(jti, Date.now() + expiraEmSegundos * 1000);
}

export function tokenRevogado(jti: string): boolean {
    const expiraEm = tokensRevogados.get(jti);

    if (!expiraEm) {
        return false;
    }

    if (expiraEm <= Date.now()) {
        tokensRevogados.delete(jti);
        return false;
    }

    return true;
}

export function limparTokensExpirados(): void {
    const agora = Date.now();

    for (const [jti, expiraEm] of tokensRevogados) {
        if (expiraEm <= agora) {
            tokensRevogados.delete(jti);
        }
    }
}
