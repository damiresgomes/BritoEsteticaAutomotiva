import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Servico } from "../entities/servico";

export interface NovoServico {
  nome_servico: string;
  descricao: string;
  preco: number;
  duracao_horas: number;
  id_categoria: number;
}

interface ServicoRow extends RowDataPacket {
  id_servico: number;
  nome_servico: string;
  descricao: string;
  preco: number;
  duracao_horas: number;
  id_categoria: number;
}

const COLUNAS = "id_servico, nome_servico, descricao, preco, duracao_horas, id_categoria";

function mapearServico(row: ServicoRow): Servico {
  return new Servico(
    row.id_servico,
    row.nome_servico,
    row.descricao,
    Number(row.preco),
    Number(row.duracao_horas),
    row.id_categoria
  );
}

export async function buscarServico(id: number): Promise<Servico | null> {
  const [servicos] = await pool.execute<ServicoRow[]>(
    `SELECT ${COLUNAS} FROM servicos WHERE id_servico = ? LIMIT 1`,
    [id]
  );
  if (servicos.length === 0) return null;
  return mapearServico(servicos[0]);
}

export async function buscarServicoPorNomeExato(nome: string): Promise<Servico | null> {
  const [servicos] = await pool.execute<ServicoRow[]>(
    `SELECT ${COLUNAS} FROM servicos WHERE nome_servico = ? LIMIT 1`,
    [nome]
  );
  if (servicos.length === 0) return null;
  return mapearServico(servicos[0]);
}

export interface FiltrosServico {
  nome?: string;
  id_categoria?: number;
  id_servico?: number;
  limite?: number;
  offset?: number;
}

export async function listarServicos(filtros: FiltrosServico = {}): Promise<{ servicos: Servico[]; total: number }> {
  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  if (filtros.nome) {
    whereClauses.push("nome_servico LIKE CONCAT('%', ?, '%')");
    params.push(filtros.nome);
  }

  if (filtros.id_categoria !== undefined) {
    whereClauses.push("id_categoria = ?");
    params.push(filtros.id_categoria);
  }

  if (filtros.id_servico !== undefined) {
    whereClauses.push("id_servico = ?");
    params.push(filtros.id_servico);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM servicos ${whereSql}`,
    params
  );
  const total = Number(totalRow?.total || 0);

  let query = `SELECT ${COLUNAS} FROM servicos ${whereSql} ORDER BY nome_servico`;
  const queryParams = [...params];

  if (filtros.limite !== undefined && filtros.offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    queryParams.push(filtros.limite, filtros.offset);
  }

  const [rows] = await pool.execute<ServicoRow[]>(query, queryParams);
  const servicos = rows.map(mapearServico);

  return { servicos, total };
}

export async function criarServico(servico: NovoServico): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO servicos (nome_servico, descricao, preco, duracao_horas, id_categoria) VALUES (?, ?, ?, ?, ?)`,
    [
      servico.nome_servico,
      servico.descricao,
      servico.preco,
      servico.duracao_horas,
      servico.id_categoria,
    ]
  );
  return resultado.insertId;
}

export async function atualizarServico(id_servico: number, servico: NovoServico): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE servicos SET nome_servico = ?, descricao = ?, preco = ?, duracao_horas = ?, id_categoria = ? WHERE id_servico = ?`,
    [
      servico.nome_servico,
      servico.descricao,
      servico.preco,
      servico.duracao_horas,
      servico.id_categoria,
      id_servico,
    ]
  );
  return resultado.affectedRows;
}

export async function excluirServico(id_servico: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `DELETE FROM servicos WHERE id_servico = ?`,
    [id_servico]
  );
  return resultado.affectedRows;
}
