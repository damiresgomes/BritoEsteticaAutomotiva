import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { CriarAgendamentoInput, StatusAgendamento } from "../schemas/agendamentoSchema";
import { AppError } from "../errors/AppError";

export interface ServicoAgendado {
  id_servico: number;
  nome_servico: string;
  preco: number;
}

export interface AgendamentoResumo {
  id_agendamento: number;
  data_hora: string;
  placa_veiculo: string | null;
  modelo_veiculo: string | null;
  status: StatusAgendamento;
  id_cliente: number;
  nome_cliente?: string;
  servicos: ServicoAgendado[];
}

interface AgendamentoRow extends RowDataPacket {
  id_agendamento: number;
  data_hora: string;
  placa_veiculo: string | null;
  modelo_veiculo: string | null;
  status: StatusAgendamento;
  id_cliente: number;
  nome_cliente?: string;
}

interface AgendamentoServicoRow extends RowDataPacket {
  id_agendamento: number;
  id_servico: number;
  nome_servico: string;
  preco: number;
}

export async function listarHorariosOcupados(data: string): Promise<string[]> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT TIME_FORMAT(data_hora, '%H:%i') AS horario
       FROM agendamentos
      WHERE DATE(data_hora) = ? AND status <> 'Cancelado'`,
    [data]
  );

  return linhas.map((linha) => linha.horario as string);
}



function converterDataHora(valor: string): string {
  return new Date(valor).toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });
}

async function carregarServicos(idsAgendamento: number[], connection = pool): Promise<Map<number, ServicoAgendado[]>> {
  const agrupados = new Map<number, ServicoAgendado[]>();
  if (idsAgendamento.length === 0) return agrupados;

  const placeholders = idsAgendamento.map(() => "?").join(",");
  const [rows] = await connection.execute<AgendamentoServicoRow[]>(
    `SELECT ags.id_agendamento, s.id_servico, s.nome_servico, s.preco
       FROM agendamento_servico ags
       JOIN servicos s ON s.id_servico = ags.id_servico
      WHERE ags.id_agendamento IN (${placeholders})
      ORDER BY s.nome_servico`,
    idsAgendamento
  );
  for (const row of rows) {
    const lista = agrupados.get(row.id_agendamento) ?? [];
    lista.push({ id_servico: row.id_servico, nome_servico: row.nome_servico, preco: row.preco });
    agrupados.set(row.id_agendamento, lista);
  }
  return agrupados;
}

async function mapearAgendamentos(rows: AgendamentoRow[], connection = pool): Promise<AgendamentoResumo[]> {
  const servicos = await carregarServicos(rows.map((row) => row.id_agendamento), connection);
  return rows.map((row) => ({
    id_agendamento: row.id_agendamento,
    data_hora: row.data_hora,
    placa_veiculo: row.placa_veiculo,
    modelo_veiculo: row.modelo_veiculo,
    status: row.status,
    id_cliente: row.id_cliente,
    ...(row.nome_cliente ? { nome_cliente: row.nome_cliente } : {}),
    servicos: servicos.get(row.id_agendamento) ?? [],
  }));
}

async function garantirServicosExistem(connection: PoolConnection, idsServicos: number[]): Promise<void> {
  const placeholders = idsServicos.map(() => "?").join(",");
  const [servicosRows] = await connection.execute<RowDataPacket[]>(
    `SELECT id_servico FROM servicos WHERE id_servico IN (${placeholders})`,
    idsServicos
  );

  if (servicosRows.length !== idsServicos.length) {
    throw new AppError(400, "Um ou mais serviços selecionados não existem.");
  }
}

export async function existeConflitoHorario(dataHora: string, idIgnorado?: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1 FROM agendamentos
      WHERE data_hora = ?
        AND status <> 'Cancelado'
        AND id_agendamento <> COALESCE(?, id_agendamento)
      LIMIT 1`,
    [converterDataHora(dataHora), idIgnorado ?? null]
  );

  return rows.length > 0;
}

export async function criarAgendamento(
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<number> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await garantirServicosExistem(connection, dados.servicos);

    const dataHora = converterDataHora(dados.data_hora);
    const [resultado] = await connection.execute<ResultSetHeader>(
      `INSERT INTO agendamentos (data_hora, placa_veiculo, modelo_veiculo, id_cliente, status)
       VALUES (?, ?, ?, ?, 'Pendente')`,
      [dataHora, dados.placa_veiculo, dados.modelo_veiculo, id_cliente]
    );

    for (const idServico of dados.servicos) {
      await connection.execute(
        "INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)",
        [resultado.insertId, idServico]
      );
    }
    await connection.commit();
    return resultado.insertId;
  } catch (erro) {
    await connection.rollback();
    throw erro;
  } finally {
    connection.release();
  }
}

export async function atualizarAgendamentoCliente(
  id_agendamento: number,
  id_cliente: number,
  dados: CriarAgendamentoInput
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await garantirServicosExistem(connection, dados.servicos);

    const dataHora = converterDataHora(dados.data_hora);
    await connection.execute<ResultSetHeader>(
      `UPDATE agendamentos
          SET data_hora = ?, placa_veiculo = ?, modelo_veiculo = ?
        WHERE id_agendamento = ? AND id_cliente = ?`,
      [dataHora, dados.placa_veiculo, dados.modelo_veiculo, id_agendamento, id_cliente]
    );

    await connection.execute(
      "DELETE FROM agendamento_servico WHERE id_agendamento = ?",
      [id_agendamento]
    );

    for (const idServico of dados.servicos) {
      await connection.execute(
        "INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)",
        [id_agendamento, idServico]
      );
    }
    await connection.commit();
  } catch (erro) {
    await connection.rollback();
    throw erro;
  } finally {
    connection.release();
  }
}

export async function listarAgendamentosCliente(id_cliente: number): Promise<AgendamentoResumo[]> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_cliente = ? ORDER BY data_hora DESC`,
    [id_cliente]
  );
  return mapearAgendamentos(rows);
}

export async function listarTodosAgendamentos(): Promise<AgendamentoResumo[]> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      ORDER BY a.data_hora DESC`
  );
  return mapearAgendamentos(rows);
}

export async function buscarAgendamentoCliente(id_agendamento: number, id_cliente: number): Promise<AgendamentoResumo | null> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_agendamento = ? AND id_cliente = ? LIMIT 1`,
    [id_agendamento, id_cliente]
  );
  return (await mapearAgendamentos(rows))[0] ?? null;
}

export async function buscarAgendamentoPorId(id_agendamento: number): Promise<AgendamentoResumo | null> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      WHERE a.id_agendamento = ? LIMIT 1`,
    [id_agendamento]
  );
  return (await mapearAgendamentos(rows))[0] ?? null;
}

export async function atualizarStatusAgendamento(id_agendamento: number, status: StatusAgendamento): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE agendamentos SET status = ? WHERE id_agendamento = ?",
    [status, id_agendamento]
  );
  return resultado.affectedRows;
}
