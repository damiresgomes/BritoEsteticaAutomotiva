import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/database";
import { PapelUsuario, Usuario } from "../entities/usuario";

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  cpf: string;
  salario: number;
  datanascimento: string;
}

export type DadosAtualizacaoUsuario = Omit<NovoUsuario, "email">;

interface UsuarioRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  cpf: string;
  salario: number;
  dataDeNascimento: string;
  ativo: string;
  papel: PapelUsuario;
}

const COLUNAS =
  "id, nome, email, senha AS senhaHash, cpf, salario, datanascimento AS dataDeNascimento, ativo, papel";

function mapearUsuario(row: UsuarioRow): Usuario {
  return new Usuario(
    row.id,
    row.nome,
    row.email,
    "",
    row.cpf,
    Number(row.salario),
    row.dataDeNascimento,
    row.senhaHash,
    row.ativo === "Sim",
    row.papel ?? "usuario"
  );
}

export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE email = ? LIMIT 1`,
    [email]
  );
  if (usuarios.length === 0) return null;
  return mapearUsuario(usuarios[0]);
}

export async function buscarPorCpf(cpf: string): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario
      WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?
      LIMIT 1`,
    [cpf]
  );
  if (usuarios.length === 0) return null;
  return mapearUsuario(usuarios[0]);
}

export async function buscarPorId(id: number): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE id = ? LIMIT 1`,
    [id]
  );
  if (usuarios.length === 0) return null;
  return mapearUsuario(usuarios[0]);
}

export async function criarUsuario(usuario: NovoUsuario): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuario (nome, email, senha, cpf, salario, datanascimento, ativo, papel)
     VALUES (?, ?, ?, ?, ?, ?, 'Sim', 'usuario')`,
    [
      usuario.nome,
      usuario.email,
      usuario.senhaHash,
      usuario.cpf,
      usuario.salario,
      usuario.datanascimento,
    ]
  );
  return resultado.insertId;
}

export async function buscarTodos(
  limite?: number,
  offset?: number
): Promise<{ usuarios: Usuario[]; total: number }> {
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM usuario WHERE ativo = 'Sim'"
  );
  const total = Number(totalRow?.total || 0);

  let query = `SELECT ${COLUNAS} FROM usuario WHERE ativo = 'Sim' ORDER BY nome`;
  const params: number[] = [];

  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);
  }

  const [rows] = await pool.execute<UsuarioRow[]>(query, params);
  const usuarios = rows.map(mapearUsuario);

  return { usuarios, total };
}

export async function atualizarUsuario(id: number, dados: DadosAtualizacaoUsuario): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE usuario
        SET nome = ?, senha = ?, cpf = ?, salario = ?, datanascimento = ?
      WHERE id = ?`,
    [
      dados.nome,
      dados.senhaHash,
      dados.cpf,
      dados.salario,
      dados.datanascimento,
      id,
    ]
  );
  return resultado.affectedRows;
}

export async function desativarUsuario(id: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE usuario SET ativo = 'Não' WHERE id = ?`,
    [id]
  );
  return resultado.affectedRows;
}
