import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export interface Categoria {
  id_categoria: number;
  nome_categoria: string;
}

interface CategoriaRow extends RowDataPacket, Categoria {}

export async function listarCategorias(): Promise<Categoria[]> {
  const [categorias] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria ORDER BY nome_categoria"
  );
  return categorias;
}

export async function buscarCategoria(id: number): Promise<Categoria | null> {
  const [categorias] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria WHERE id_categoria = ?",
    [id]
  );
  return categorias[0] ?? null;
}

export async function criarCategoria(nome: string): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO categoria (nome_categoria) VALUES (?)",
    [nome]
  );
  return resultado.insertId;
}

export async function atualizarCategoria(id: number, nome: string): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE categoria SET nome_categoria = ? WHERE id_categoria = ?",
    [nome, id]
  );
  return resultado.affectedRows;
}

export async function excluirCategoria(id: number): Promise<void> {
  await pool.execute("DELETE FROM categoria WHERE id_categoria = ?", [id]);
}

export async function categoriaTemServicos(id: number): Promise<boolean> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    "SELECT id_servico FROM servicos WHERE id_categoria = ? LIMIT 1",
    [id]
  );
  return linhas.length > 0;
}
