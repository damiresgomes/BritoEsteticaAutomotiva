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

export interface AgendamentoAdminRow extends RowDataPacket {
  id: number;
  clienteId: number;
  cliente: string;
  servico: string;
  servicoId: number;
  extras: number[];
  placa: string;
  veiculo: string;
  observacoes: string | null;
  data: string;
  horario: string;
  status: "Pendente" | "Confirmado" | "Cancelado";
}

interface AgendamentoAdminDbRow extends RowDataPacket {
  id: number;
  clienteId: number;
  cliente: string;
  servico: string;
  servicoId: number | null;
  extrasIds: string | null;
  placa: string;
  veiculo: string;
  observacoes: string | null;
  data: string;
  horario: string;
  status: "Pendente" | "Confirmado" | "Cancelado";
}

export async function listarAgendamentosAdmin(): Promise<AgendamentoAdminRow[]> {
  const [linhas] = await pool.execute<AgendamentoAdminDbRow[]>(
    `SELECT a.id_agendamento AS id,
            c.id_cliente AS clienteId,
            c.nome AS cliente,
            GROUP_CONCAT(s.nome_servico ORDER BY s.nome_servico SEPARATOR ', ') AS servico,
            MAX(CASE WHEN s.id_categoria = 1 THEN s.id_servico END) AS servicoId,
            GROUP_CONCAT(
              CASE WHEN s.id_categoria = 2 THEN s.id_servico END
              ORDER BY s.id_servico SEPARATOR ','
            ) AS extrasIds,
            a.placa_veiculo AS placa,
            a.modelo_veiculo AS veiculo,
            a.observacoes,
            DATE_FORMAT(a.data_hora, '%Y-%m-%d') AS data,
            TIME_FORMAT(a.data_hora, '%H:%i') AS horario,
            a.status
       FROM agendamentos a
       JOIN clientes c ON c.id_cliente = a.id_cliente
       LEFT JOIN agendamento_servico ags ON ags.id_agendamento = a.id_agendamento
       LEFT JOIN servicos s ON s.id_servico = ags.id_servico
      GROUP BY a.id_agendamento, c.id_cliente, c.nome, a.data_hora,
               a.placa_veiculo, a.modelo_veiculo, a.observacoes, a.status
      ORDER BY a.data_hora DESC`
  );
  return linhas.map((linha) => ({
    ...linha,
    servicoId: linha.servicoId ?? 0,
    extras: linha.extrasIds
      ? linha.extrasIds.split(",").map(Number).filter(Number.isInteger)
      : [],
  }));
}

export async function atualizarAgendamentoCompleto(
  id: number,
  dados: NovoAgendamentoCompleto,
  status: "Pendente" | "Confirmado" | "Cancelado"
): Promise<"atualizado" | "nao-encontrado" | "horario-ocupado"> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [agendamentos] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_agendamento FROM agendamentos WHERE id_agendamento = ? FOR UPDATE",
      [id]
    );
    if (!agendamentos.length) {
      await conexao.rollback();
      return "nao-encontrado";
    }

    const [ocupados] = await conexao.execute<RowDataPacket[]>(
      `SELECT id_agendamento FROM agendamentos
        WHERE data_hora = ? AND status <> 'Cancelado' AND id_agendamento <> ?
        FOR UPDATE`,
      [dados.data_hora, id]
    );
    if (ocupados.length && status !== "Cancelado") {
      await conexao.rollback();
      return "horario-ocupado";
    }

    await conexao.execute<ResultSetHeader>(
      `UPDATE agendamentos
          SET data_hora = ?, placa_veiculo = ?, modelo_veiculo = ?,
              observacoes = ?, id_cliente = ?, status = ?
        WHERE id_agendamento = ?`,
      [
        dados.data_hora,
        dados.placa_veiculo,
        dados.modelo_veiculo,
        dados.observacoes || null,
        dados.id_cliente,
        status,
        id,
      ]
    );

    await conexao.execute<ResultSetHeader>(
      "DELETE FROM agendamento_servico WHERE id_agendamento = ?",
      [id]
    );
    for (const idServico of dados.ids_servicos) {
      await conexao.execute<ResultSetHeader>(
        "INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)",
        [id, idServico]
      );
    }

    await conexao.commit();
    return "atualizado";
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function atualizarStatusAgendamento(
  id: number,
  status: "Pendente" | "Confirmado" | "Cancelado"
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE agendamentos SET status = ? WHERE id_agendamento = ?",
    [status, id]
  );
  return resultado.affectedRows;
}

export async function buscarStatusAgendamento(
  id: number
): Promise<"Pendente" | "Confirmado" | "Cancelado" | null> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    "SELECT status FROM agendamentos WHERE id_agendamento = ?",
    [id]
  );
  return (linhas[0]?.status as "Pendente" | "Confirmado" | "Cancelado") ?? null;
}

// Horários (ex: "09:00") que já têm agendamento ativo na data
export async function listarHorariosOcupados(
  data: string,
  ignorarAgendamentoId?: number
): Promise<string[]> {
  const ignorarAtual = ignorarAgendamentoId === undefined ? "" : " AND id_agendamento <> ?";
  const parametros = ignorarAgendamentoId === undefined
    ? [data]
    : [data, ignorarAgendamentoId];
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT TIME_FORMAT(data_hora, '%H:%i') AS horario
       FROM agendamentos
      WHERE DATE(data_hora) = ? AND status <> 'Cancelado'${ignorarAtual}`,
    parametros
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