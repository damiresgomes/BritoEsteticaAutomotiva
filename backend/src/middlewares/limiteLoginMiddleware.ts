import rateLimit from "express-rate-limit";

export const limiteLoginMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." },
});
