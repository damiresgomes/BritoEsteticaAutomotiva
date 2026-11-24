// Importa o tipo Server do Node para tipar o servidor HTTP retornado pelo listen.
import { Server } from "http";
// Importa a função que monta a aplicação Express configurada.
import { buildApp } from "./app";
// Importa variáveis de ambiente validadas (inclui PORT).
import { env } from "./config/env";
// Importa o pool MySQL para testar conexão e encerrar conexões no shutdown.
import { pool } from "./config/database";

// Função responsável por encerrar o servidor HTTP e o pool do banco de forma limpa.
function encerrar(servidor: Server): void {
  // Fecha o servidor HTTP, parando de aceitar novas conexões.
  servidor.close(async () => {
    // Encerra o pool MySQL, liberando conexões abertas.
    await pool.end();
    // Finaliza o processo Node com código 0 (encerramento normal).
    process.exit(0);
  });
}

// Função assíncrona que inicializa a aplicação.
async function iniciar(): Promise<void> {
  // Executa uma consulta simples para garantir que o banco está acessível antes de subir a API.
  await pool.query("SELECT 1");

  // Cria o app e inicia a escuta na porta configurada, em todas as interfaces de rede.
  const servidor = buildApp().listen(env.PORT, "0.0.0.0", () => {
    // Loga no console a porta em que o servidor está rodando.
    console.log(`Servidor rodando na porta ${env.PORT}`);
  });

  // Registra handlers para sinais de encerramento enviados por Docker/SO.
  for (const sinal of ["SIGTERM", "SIGINT"] as const) {
    // Ao receber SIGTERM ou SIGINT, chama a função de encerramento limpo.
    process.on(sinal, () => encerrar(servidor));
  }
}

// Chama a inicialização e captura erro caso banco/env impeçam a subida.
iniciar().catch((erro: unknown) => {
  // Exibe mensagem amigável e o erro técnico no console.
  console.error("Nǜo foi poss��vel iniciar o servidor. O banco estǭ no ar e o .env estǭ correto?", erro);
  // Encerra com código 1 indicando falha na inicialização.
  process.exit(1);
});

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Resumo detalhado:
// - Responsabilidade: bootstrap do processo backend.
// - Fluxo: valida conectividade com MySQL (`SELECT 1`) antes de aceitar tráfego.
// - Operação: escuta em `0.0.0.0:env.PORT`, loga inicialização.
// - Confiabilidade: trata SIGINT/SIGTERM para fechar servidor HTTP e pool MySQL, evitando conexões penduradas.
