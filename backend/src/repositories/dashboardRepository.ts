import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export async function buscarResumoUsuario() {
  const [[agendamentosHoje]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,
            COALESCE(SUM(status = 'Confirmado'), 0) AS confirmados,
            COALESCE(SUM(status = 'Em atendimento'), 0) AS em_atendimento,
            COALESCE(SUM(status = 'Concluído'), 0) AS concluidos,
            COALESCE(SUM(status = 'Cancelado'), 0) AS cancelados
       FROM agendamentos
      WHERE data_hora >= UTC_DATE() AND data_hora < DATE_ADD(UTC_DATE(), INTERVAL 1 DAY)`
  );

  const [[faturamento]] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(s.preco), 0) AS faturamento_concluido_mes
       FROM agendamentos a
       JOIN agendamento_servico ags ON ags.id_agendamento = a.id_agendamento
       JOIN servicos s ON s.id_servico = ags.id_servico
      WHERE a.status = 'Concluído'
        AND a.data_hora >= DATE_FORMAT(UTC_DATE(), '%Y-%m-01')
        AND a.data_hora < DATE_ADD(DATE_FORMAT(UTC_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`
  );

  const [servicosMaisSolicitados] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id_servico, s.nome_servico, COUNT(*) AS quantidade
       FROM agendamento_servico ags
       JOIN servicos s ON s.id_servico = ags.id_servico
       JOIN agendamentos a ON a.id_agendamento = ags.id_agendamento
      WHERE a.status <> 'Cancelado'
      GROUP BY s.id_servico, s.nome_servico
      ORDER BY quantidade DESC, s.nome_servico
      LIMIT 5`
  );

  return { agendamentosHoje, faturamento, servicosMaisSolicitados };
}
