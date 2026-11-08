import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export interface NovaCategoria {
    nome_categoria: string;
}

export interface Categoria extends NovaCategoria {
    id_categoria: number;
}

interface CategoriaRow extends RowDataPacket, Categoria { }

const COLUNAS = "id_categoria, nome_categoria";

export async function listarCategorias(): Promise<Categoria[]> {
    const [categorias] = await pool.execute<CategoriaRow[]>(
        `SELECT ${COLUNAS} FROM categoria ORDER BY nome_categoria`
    );
    return categorias;
}

export async function buscarCategoriaPorId(id_categoria: number): Promise<Categoria | null> {
    const [categorias] = await pool.execute<CategoriaRow[]>(
        `SELECT ${COLUNAS} FROM categoria WHERE id_categoria = ?`,
        [id_categoria]
    );
    return categorias[0] ?? null;
}

export async function buscarCategoriaPorNomeExato(nome_categoria: string): Promise<Categoria | null> {
    const [categorias] = await pool.execute<CategoriaRow[]>(
        `SELECT ${COLUNAS} FROM categoria WHERE nome_categoria = ?`,
        [nome_categoria]
    );
    return categorias[0] ?? null;
}

export async function criarCategoria(categoria: NovaCategoria): Promise<number> {
    const [resultado] = await pool.execute<ResultSetHeader>(
        "INSERT INTO categoria (nome_categoria) VALUES (?)",
        [categoria.nome_categoria]
    );
    return resultado.insertId;
}

export async function atualizarCategoria(id_categoria: number, categoria: NovaCategoria): Promise<number> {
    const [resultado] = await pool.execute<ResultSetHeader>(
        "UPDATE categoria SET nome_categoria = ? WHERE id_categoria = ?",
        [categoria.nome_categoria, id_categoria]
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
