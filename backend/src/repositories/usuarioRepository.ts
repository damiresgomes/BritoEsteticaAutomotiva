import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { Usuario } from "../entities/usuario";


export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  cpf: string;
  salario: number;
  datanascimento: string;
}

export type DadosAtualizacaoUsuario = Omit<NovoUsuario, "email">;

interface UsuarioRow extends RowDataPacket, Usuario { }

const COLUNAS = "id, nome, email, senha AS senhaHash, cpf, salario, datanascimento AS dataDeNascimento, ativo, papel";

export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE email = ?`,
    [email]
  );

  return usuarios[0] ?? null;
}

export async function buscarPorCpf(cpf: string): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario
        WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?`,
    [cpf]
  );

  return usuarios[0] ?? null;
}

export async function buscarPorId(id: number): Promise<Usuario | null> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE id = ?`,
    [id]
  );

  return usuarios[0] ?? null;
}

export async function criarUsuario(usuario: NovoUsuario): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuario
         (nome, email, senha, cpf, salario, datanascimento, ativo)
       VALUES (?, ?, ?, ?, ?, ?, 'Sim')`,
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

export async function buscarTodos(): Promise<{ id: number; nome: string; email: string; papel: string }[]> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT id, nome, email, papel FROM usuario WHERE ativo = 'Sim'`
  );
  return usuarios;
}

export async function atualizarUsuario(id: number, dados: DadosAtualizacaoUsuario): Promise<void> {
  await pool.execute(
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
}

export async function desativarUsuario(id: number): Promise<void> {
  await pool.execute(
    `UPDATE usuario SET ativo = 'Não' WHERE id = ?`,
    [id]
  );
}
