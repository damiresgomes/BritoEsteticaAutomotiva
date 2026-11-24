// Mapa em memória: jti do token -> timestamp de expiração em ms.
const tokensExpirados = new Map<string, number>();

// Marca um token como revogado/expirado até seu tempo natural de expiração.
export function expirarToken(jti: string, expiraEmSegundos: number): void {
    // Remove tokens já vencidos para evitar crescimento infinito do Map.
    limparTokensExpirados();
    // Armazena o jti com o momento absoluto em que deve deixar de ser considerado.
    tokensExpirados.set(jti, Date.now() + expiraEmSegundos * 1000);
}

// Verifica se um jti está na lista de revogação e ainda dentro do prazo.
export function tokenExpirado(jti: string): boolean {
    // Busca o timestamp de expiração da revogação.
    const expiraEm = tokensExpirados.get(jti);

    // Se não existe no mapa, token não foi revogado por logout.
    if (!expiraEm) {
        return false;
    }

    // Se a revogação já venceu, remove entrada e considera não revogado (token natural já tratável por exp).
    if (expiraEm <= Date.now()) {
        tokensExpirados.delete(jti);
        return false;
    }

    // Ainda está revogado.
    return true;
}

// Limpa entradas vencidas do mapa de revogação.
export function limparTokensExpirados(): void {
    // Captura o instante atual uma vez para comparação consistente.
    const agora = Date.now();

    // Percorre todas as entradas do mapa.
    for (const [jti, expiraEm] of tokensExpirados) {
        // Se o prazo já passou, remove a entrada.
        if (expiraEm <= agora) {
            tokensExpirados.delete(jti);
        }
    }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: revogação de JWT em memória.
// - Mecanismo: Map jti -> timestamp de expiração; `expirarToken` registra no logout, `tokenExpirado` consulta, `limparTokensExpirados` evita crescimento.
// - Limitação: estado é perdido ao reiniciar o processo (conforme AGENTS.md).
