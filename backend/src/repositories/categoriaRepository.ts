import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { Categoria } from "../entities/categoria";

interface CategoriaRow extends RowDataPacket {
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: number;
  // Define a propriedade/campo 'nome_categoria' no objeto/estrutura.
  nome_categoria: string;
}

export async function listarCategorias(
  limite?: number,
  offset?: number
): Promise<{ categorias: Categoria[]; total: number }> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM categoria"
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = "SELECT id_categoria, nome_categoria FROM categoria ORDER BY nome_categoria";
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<CategoriaRow[]>(query, params);
  // Cria a constante local 'categorias'; usar const evita reatribuição acidental.
  const categorias = rows.map((row) => new Categoria(row.id_categoria, row.nome_categoria));

  // Retorna { categorias, total } para quem chamou esta função.
  return { categorias, total };
}

// Exporta a função assíncrona 'buscarCategoriaPorId'(id_categoria: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarCategoriaPorId(id_categoria: number): Promise<Categoria | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria WHERE id_categoria = ? LIMIT 1",
    [id_categoria]
  );
  if (rows.length === 0) return null;
  // Retorna new Categoria(rows[0].id_categoria, rows[0].nome_categoria) para quem chamou esta função.
  return new Categoria(rows[0].id_categoria, rows[0].nome_categoria);
}

// Exporta a função assíncrona 'buscarCategoriaPorNomeExato'(nome_categoria: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarCategoriaPorNomeExato(nome_categoria: string): Promise<Categoria | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<CategoriaRow[]>(
    "SELECT id_categoria, nome_categoria FROM categoria WHERE nome_categoria = ? LIMIT 1",
    [nome_categoria]
  );
  if (rows.length === 0) return null;
  // Retorna new Categoria(rows[0].id_categoria, rows[0].nome_categoria) para quem chamou esta função.
  return new Categoria(rows[0].id_categoria, rows[0].nome_categoria);
}

// Exporta a função assíncrona 'criarCategoria'(nome_categoria: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarCategoria(nome_categoria: string): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO categoria (nome_categoria) VALUES (?)",
    [nome_categoria]
  );
  // Retorna resultado.insertId para quem chamou esta função.
  return resultado.insertId;
}

// Exporta a função assíncrona 'atualizarCategoria'(id_categoria: number, nome_categoria: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarCategoria(id_categoria: number, nome_categoria: string): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE categoria SET nome_categoria = ? WHERE id_categoria = ?",
    [nome_categoria, id_categoria]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'excluirCategoria'(id_categoria: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirCategoria(id_categoria: number): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "DELETE FROM categoria WHERE id_categoria = ?",
    [id_categoria]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'existeServicoNaCategoria'(id_categoria: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function existeServicoNaCategoria(id_categoria: number): Promise<boolean> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicos] = await pool.execute<RowDataPacket[]>(
    "SELECT 1 FROM servicos WHERE id_categoria = ? LIMIT 1",
    [id_categoria]
  );
  // Retorna servicos.length > 0 para quem chamou esta função.
  return servicos.length > 0;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Camada SQL de categorias: listar, paginar, criar, editar e excluir.
