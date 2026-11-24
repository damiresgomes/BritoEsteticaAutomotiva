// Importa rateLimit para limitar tentativas repetidas de login.
import rateLimit from "express-rate-limit";

// Middleware de rate limit aplicado nas rotas de login/cadastro sensíveis.
export const limiteLoginMiddleware = rateLimit({
    // Janela de tempo: 15 minutos em milissegundos.
    windowMs: 15 * 60 * 1000,
    // Máximo de 10 tentativas por janela por IP/chave padrão.
    max: 10,
    // Só conta tentativas falhas/sucessos conforme config; aqui ignora sucessos no contador.
    skipSuccessfulRequests: true,
    // Retorna headers RateLimit-* padrão.
    standardHeaders: true,
    // Desativa headers antigos X-RateLimit-*.
    legacyHeaders: false,
    // Mensagem JSON retornada quando o limite é excedido.
    message: { message: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." },
});

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: mitigar brute force em login/cadastro.
// - Configuração: janela 15 min, máx 10 tentativas, conta falhas (`skipSuccessfulRequests`), headers padrão RateLimit.
// - Resposta: 429 com mensagem amigável em pt-BR quando limite excedido.
