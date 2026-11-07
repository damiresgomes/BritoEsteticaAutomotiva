import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface NovoAgendamentoCompleto {
  id_cliente: number;
  placa_veiculo: string;
  modelo_veiculo: string;
  observacoes?: string;
  data_hora: string; // "2026-11-10 09:00:00"
  ids_servicos: number[]; // serviço principal + acréscimos
}

// Horários (ex: "09:00") que já têm agendamento ativo na data
export async function listarHorariosOcupados(data: string): Promise<string[]> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT TIME_FORMAT(data_hora, '%H:%i') AS horario
       FROM agendamentos
      WHERE DATE(data_hora) = ? AND status <> 'Cancelado'`,
    [data]
  );

  return linhas.map((linha) => linha.horario as string);
}

// Cria o agendamento e seus serviços para o cliente autenticado numa transação.
// Retorna o id criado, ou null se o horário foi ocupado nesse meio tempo.
export async function criarAgendamentoCompleto(
  dados: NovoAgendamentoCompleto
): Promise<number | null> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    // Confere de novo dentro da transação, para duas pessoas não pegarem o mesmo horário
    const [ocupados] = await conexao.execute<RowDataPacket[]>(
      `SELECT id_agendamento FROM agendamentos
        WHERE data_hora = ? AND status <> 'Cancelado' FOR UPDATE`,
      [dados.data_hora]
    );

    if (ocupados.length > 0) {
      await conexao.rollback();
      return null;
    }

    const [agendamento] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO agendamentos (data_hora, placa_veiculo, modelo_veiculo, observacoes, id_cliente)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dados.data_hora,
        dados.placa_veiculo,
        dados.modelo_veiculo,
        dados.observacoes || null,
        dados.id_cliente,
      ]
    );

    for (const idServico of dados.ids_servicos) {
      await conexao.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)`,
        [agendamento.insertId, idServico]
      );
    }

    await conexao.commit();
    return agendamento.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}