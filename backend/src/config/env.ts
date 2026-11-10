import path from "node:path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  DB_HOST: z.string().min(1, "DB_HOST é obrigatório"),
  DB_PORT: z.coerce.number().int().positive("DB_PORT inválido"),
  DB_USER: z.string().min(1, "DB_USER é obrigatório"),
  DB_PASS: z.string().min(1, "DB_PASS é obrigatório"),
  DB_NAME: z.string().min(1, "DB_NAME é obrigatório"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET é obrigatório"),
  CORS_ORIGINS: z
    .string()
    .trim()
    .min(1, "CORS_ORIGINS é obrigatório")
    .default("http://localhost:5173"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variáveis de ambiente inválidas:");
  console.error(z.treeifyError(resultado.error));
  process.exit(1);
}

export const env = resultado.data;

