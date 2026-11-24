// Importa mysql2/promise para usar MySQL com API baseada em Promises/async-await.
import mysql from "mysql2/promise";
// Importa configurações de banco validadas do env.
import { env } from "./env";

// Cria e exporta um pool de conexões MySQL reutilizável em toda a aplicação.
export const pool = mysql.createPool({
  // Endereço do servidor MySQL.
  host: env.DB_HOST,
  // Porta do servidor MySQL.
  port: env.DB_PORT,
  // Usuário usado para autenticar no MySQL.
  user: env.DB_USER,
  // Senha do usuário do MySQL.
  password: env.DB_PASS,
  // Nome do banco de dados a ser usado.
  database: env.DB_NAME,
  // Faz conexões aguardarem quando o limite do pool estiver ocupado.
  waitForConnections: true,
  // Limita quantidade máxima de conexões simultâneas no pool.
  connectionLimit: 10,
  // Força timezone UTC para evitar deslocamentos inesperados de data/hora.
  timezone: "Z",
  // Retorna datas como string, preservando formato vindo do banco.
  dateStrings: true,
  // Converte DECIMAL/NUMERIC para number no JavaScript.
  decimalNumbers: true,
});

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: criar pool MySQL compartilhado.
// - Configurações importantes: `waitForConnections`, `connectionLimit=10`, `timezone='Z'`, `dateStrings=true`, `decimalNumbers=true`.
// - Impacto: repositories usam `pool.execute` com prepared statements; datas vêm como string e decimais como number.
