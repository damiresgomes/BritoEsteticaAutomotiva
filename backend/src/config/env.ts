// Importa path para resolver caminho absoluto do arquivo .env do backend.
import path from "node:path";
// Importa dotenv para carregar variáveis de ambiente de arquivos .env.
import dotenv from "dotenv";

// Carrega .env do diretório atual/processo, se existir.
dotenv.config();
// Também tenta carregar backend/.env relativo a este arquivo compilado/em src, garantindo execução em contextos diferentes.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Importa Zod para validar e tipar variáveis de ambiente em runtime.
import { z } from "zod";

// Define o schema de validação das variáveis de ambiente esperadas.
const envSchema = z.object({
  // PORT: converte para número inteiro positivo; usa 3333 como padrão.
  PORT: z.coerce.number().int().positive().default(3333),
  // DB_HOST: host do MySQL; obrigatório e não vazio.
  DB_HOST: z.string().min(1, "DB_HOST Ǹ obrigat��rio"),
  // DB_PORT: porta do MySQL; número inteiro positivo.
  DB_PORT: z.coerce.number().int().positive("DB_PORT invǭlido"),
  // DB_USER: usuário do banco; obrigatório.
  DB_USER: z.string().min(1, "DB_USER Ǹ obrigat��rio"),
  // DB_PASS: senha do banco; obrigatória.
  DB_PASS: z.string().min(1, "DB_PASS Ǹ obrigat��rio"),
  // DB_NAME: nome do banco; obrigatório.
  DB_NAME: z.string().min(1, "DB_NAME Ǹ obrigat��rio"),
  // JWT_SECRET: segredo para assinar tokens JWT; obrigatório.
  JWT_SECRET: z.string().min(1, "JWT_SECRET Ǹ obrigat��rio"),
  // CORS_ORIGINS: lista de origens permitidas separadas por vírgula; tem padrão para dev local.
  CORS_ORIGINS: z
    .string()
    .trim()
    .min(1, "CORS_ORIGINS Ǹ obrigat��rio")
    .default("http://localhost:5173"),
  // TRUST_PROXY: indica quantos proxies confiar; 0 desativa comportamento de proxy confiável.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

// Valida process.env contra o schema sem lançar exceção automática.
const resultado = envSchema.safeParse(process.env);

// Se a validação falhar, mostra erros e encerra o processo.
if (!resultado.success) {
  // Loga título do erro de configuração.
  console.error("Variǭveis de ambiente invǭlidas:");
  // Exibe árvore de erros do Zod para facilitar correção.
  console.error(z.treeifyError(resultado.error));
  // Encerra com falha, pois sem env válido a aplicação não deve subir.
  process.exit(1);
}

// Exporta os dados validados e tipados para uso no restante do backend.
export const env = resultado.data;

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: carregar e validar configuração de ambiente.
// - Fontes: `dotenv.config()` padrão e `backend/.env` relativo ao arquivo.
// - Validação: Zod garante tipos/defaults (PORT, DB_*, JWT_SECRET, CORS_ORIGINS, TRUST_PROXY).
// - Falha rápida: se inválido, imprime erro estruturado e encerra com exit(1), evitando subir app mal configurado.
