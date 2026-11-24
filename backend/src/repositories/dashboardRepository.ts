import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";

// Exporta a função assíncrona 'buscarResumoUsuario'(); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarResumoUsuario() {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[agendamentosHoje]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total,
            // Executa: COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,.
            COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,
            // Executa: COALESCE(SUM(status = 'Confirmado'), 0) AS confirmados,.
            COALESCE(SUM(status = 'Confirmado'), 0) AS confirmados,
            // Executa: COALESCE(SUM(status = 'Em atendimento'), 0) AS em_atendimento,.
            COALESCE(SUM(status = 'Em atendimento'), 0) AS em_atendimento,
            // Executa: COALESCE(SUM(status = 'Concluído'), 0) AS concluidos,.
            COALESCE(SUM(status = 'Concluído'), 0) AS concluidos,
            // Executa: COALESCE(SUM(status = 'Cancelado'), 0) AS cancelados.
            COALESCE(SUM(status = 'Cancelado'), 0) AS cancelados
       FROM agendamentos
      WHERE data_hora >= UTC_DATE() AND data_hora < DATE_ADD(UTC_DATE(), INTERVAL 1 DAY)`
  );

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[faturamento]] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(s.preco), 0) AS faturamento_concluido_mes
       FROM agendamentos a
       JOIN agendamento_servico ags ON ags.id_agendamento = a.id_agendamento
       JOIN servicos s ON s.id_servico = ags.id_servico
      WHERE a.status = 'Concluído'
        AND a.data_hora >= DATE_FORMAT(UTC_DATE(), '%Y-%m-01')
        AND a.data_hora < DATE_ADD(DATE_FORMAT(UTC_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`
  );

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicosMaisSolicitados] = await pool.execute<RowDataPacket[]>(
    `SELECT nome_servico, total_vendas AS quantidade
       FROM vw_servico_mais_vendido
      LIMIT 5`
  );

  // Retorna { agendamentosHoje, faturamento, servicosMaisSolicitados } para quem chamou esta função.
  return { agendamentosHoje, faturamento, servicosMaisSolicitados };
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Consultas SQL agregadas para alimentar o dashboard.
