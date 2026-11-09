import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { CriarAgendamentoInput } from "../schemas/agendamentoSchema";
import { RequisicaoInvalidaError } from "../errors/AppError";
import { Agendamento, ServicoItemAgendado, StatusAgendamento } from "../entities/agendamento";
import { Carro } from "../entities/carro";

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

  return linhas.map((linha) => String(linha.horario));
}

function converterDataHora(valor: string): string {
  return new Date(valor).toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });
}

async function carregarServicos(
  idsAgendamento: number[],
  connection: PoolConnection | typeof pool = pool
): Promise<Map<number, ServicoItemAgendado[]>> {
  const agrupados = new Map<number, ServicoItemAgendado[]>();
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
    lista.push({
      id_servico: row.id_servico,
      nome_servico: row.nome_servico,
      preco: Number(row.preco),
    });
    agrupados.set(row.id_agendamento, lista);
  }
  return agrupados;
}

async function mapearAgendamentos(
  rows: AgendamentoRow[],
  connection: PoolConnection | typeof pool = pool
): Promise<Agendamento[]> {
  const ids = rows.map((row) => row.id_agendamento);
  const servicosMap = await carregarServicos(ids, connection);

  return rows.map((row) => {
    const carro = new Carro(
      row.placa_veiculo ?? "SEM-PLACA",
      row.modelo_veiculo ?? "Não informado"
    );
    const servicos = servicosMap.get(row.id_agendamento) ?? [];
    return new Agendamento(
      row.id_agendamento,
      row.data_hora,
      row.status,
      row.id_cliente,
      carro,
      servicos,
      row.nome_cliente
    );
  });
}

async function garantirServicosExistem(connection: PoolConnection, idsServicos: number[]): Promise<void> {
  const placeholders = idsServicos.map(() => "?").join(",");
  const [servicosRows] = await connection.execute<RowDataPacket[]>(
    `SELECT id_servico FROM servicos WHERE id_servico IN (${placeholders})`,
    idsServicos
  );

  if (servicosRows.length !== idsServicos.length) {
    throw new RequisicaoInvalidaError("Um ou mais serviços selecionados não existem.");
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

    const idAgendamento = resultado.insertId;

    if (dados.servicos.length > 0) {
      const placeholders = dados.servicos.map(() => "(?, ?)").join(", ");
      const params: number[] = [];
      for (const idServico of dados.servicos) {
        params.push(idAgendamento, idServico);
      }
      await connection.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES ${placeholders}`,
        params
      );
    }

    await connection.commit();
    return idAgendamento;
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
): Promise<number> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await garantirServicosExistem(connection, dados.servicos);

    const dataHora = converterDataHora(dados.data_hora);
    const [resultado] = await connection.execute<ResultSetHeader>(
      `UPDATE agendamentos
          SET data_hora = ?, placa_veiculo = ?, modelo_veiculo = ?
        WHERE id_agendamento = ? AND id_cliente = ?`,
      [dataHora, dados.placa_veiculo, dados.modelo_veiculo, id_agendamento, id_cliente]
    );

    await connection.execute(
      "DELETE FROM agendamento_servico WHERE id_agendamento = ?",
      [id_agendamento]
    );

    if (dados.servicos.length > 0) {
      const placeholders = dados.servicos.map(() => "(?, ?)").join(", ");
      const params: number[] = [];
      for (const idServico of dados.servicos) {
        params.push(id_agendamento, idServico);
      }
      await connection.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES ${placeholders}`,
        params
      );
    }

    await connection.commit();
    return resultado.affectedRows;
  } catch (erro) {
    await connection.rollback();
    throw erro;
  } finally {
    connection.release();
  }
}

export async function listarAgendamentosCliente(
  id_cliente: number,
  limite?: number,
  offset?: number
): Promise<{ agendamentos: Agendamento[]; total: number }> {
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM agendamentos WHERE id_cliente = ?",
    [id_cliente]
  );
  const total = Number(totalRow?.total || 0);

  let query = `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_cliente = ? ORDER BY data_hora DESC`;
  const params: (number | string)[] = [id_cliente];

  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);
  }

  const [rows] = await pool.execute<AgendamentoRow[]>(query, params);
  const agendamentos = await mapearAgendamentos(rows);

  return { agendamentos, total };
}

export async function listarTodosAgendamentos(
  limite?: number,
  offset?: number
): Promise<{ agendamentos: Agendamento[]; total: number }> {
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM agendamentos"
  );
  const total = Number(totalRow?.total || 0);

  let query = `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      ORDER BY a.data_hora DESC`;
  const params: number[] = [];

  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);
  }

  const [rows] = await pool.execute<AgendamentoRow[]>(query, params);
  const agendamentos = await mapearAgendamentos(rows);

  return { agendamentos, total };
}

export async function buscarAgendamentoCliente(
  id_agendamento: number,
  id_cliente: number
): Promise<Agendamento | null> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_agendamento = ? AND id_cliente = ? LIMIT 1`,
    [id_agendamento, id_cliente]
  );
  if (rows.length === 0) return null;
  const lista = await mapearAgendamentos(rows);
  return lista[0] ?? null;
}

export async function buscarAgendamentoPorId(id_agendamento: number): Promise<Agendamento | null> {
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      WHERE a.id_agendamento = ? LIMIT 1`,
    [id_agendamento]
  );
  if (rows.length === 0) return null;
  const lista = await mapearAgendamentos(rows);
  return lista[0] ?? null;
}

export async function atualizarStatusAgendamento(
  id_agendamento: number,
  status: StatusAgendamento
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE agendamentos SET status = ? WHERE id_agendamento = ?",
    [status, id_agendamento]
  );
  return resultado.affectedRows;
}
