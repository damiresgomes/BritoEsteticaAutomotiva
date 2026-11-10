import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { Categoria } from "../entities/categoria";

interface CategoriaRow extends RowDataPacket {
  id_categoria: number;
  nome_categoria: string;
}

export async function listarCategorias(
  limite?: number,
  offset?: number
): Promise<{ categorias: Categoria[]; total: number }> {
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM categoria"
  );
  const total = Number(totalRow?.total || 0);

  let query = "SELECT id_categoria, nome_categoria FROM categoria ORDER BY nome_categoria";
  const params: number[] = [];

  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);
  }

  const [rows] = await pool.execute<CategoriaRow[]>(query, params);
  const categorias = rows.map((row) => new Categoria(row.id_categoria, row.nome_categoria));

  return { categorias, total };
}

export async function buscarCategoriaPorId(id_categoria: number): Promise<Categoria | null> {
  const [rows] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria WHERE id_categoria = ? LIMIT 1",
    [id_categoria]
  );
  if (rows.length === 0) return null;
  return new Categoria(rows[0].id_categoria, rows[0].nome_categoria);
}

export async function buscarCategoriaPorNomeExato(nome_categoria: string): Promise<Categoria | null> {
  const [rows] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria WHERE nome_categoria = ? LIMIT 1",
    [nome_categoria]
  );
  if (rows.length === 0) return null;
  return new Categoria(rows[0].id_categoria, rows[0].nome_categoria);
}

export async function criarCategoria(nome_categoria: string): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO categoria (nome_categoria) VALUES (?)",
    [nome_categoria]
  );
  return resultado.insertId;
}

export async function atualizarCategoria(id_categoria: number, nome_categoria: string): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE categoria SET nome_categoria = ? WHERE id_categoria = ?",
    [nome_categoria, id_categoria]
  );
  return resultado.affectedRows;
}

export async function excluirCategoria(id_categoria: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "DELETE FROM categoria WHERE id_categoria = ?",
    [id_categoria]
  );
  return resultado.affectedRows;
}

export async function existeServicoNaCategoria(id_categoria: number): Promise<boolean> {
  const [servicos] = await pool.execute<RowDataPacket[]>(
    "SELECT 1 FROM servicos WHERE id_categoria = ? LIMIT 1",
    [id_categoria]
  );
  return servicos.length > 0;
}
