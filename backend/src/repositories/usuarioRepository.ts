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

interface UsuarioRow extends RowDataPacket, Usuario { }

const COLUNAS = "id, nome, email, senha, cpf, salario, datanascimento, ativo";

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
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [resultado] = await conexao.execute<ResultSetHeader>(
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
    await conexao.execute(
      `INSERT INTO contas_acesso (email, senha, papel, ativo, id_usuario)
       VALUES (?, ?, 'admin', 'Sim', ?)`,
      [usuario.email, usuario.senhaHash, resultado.insertId]
    );

    await conexao.commit();
    return resultado.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function buscarTodos(): Promise<{ id: number; nome: string; email: string }[]> {
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT id, nome, email FROM usuario WHERE ativo = 'Sim'`
  );
  return usuarios;
}

export async function atualizarUsuario(id: number, dados: NovoUsuario): Promise<void> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_usuario = ? AND papel = 'admin' FOR UPDATE`,
      [id]
    );
    if (contas.length !== 1) {
      throw new Error("Conta de acesso administrativa não encontrada");
    }

    await conexao.execute(
      `UPDATE usuario
          SET nome = ?, email = ?, senha = ?, cpf = ?, salario = ?, datanascimento = ?
        WHERE id = ?`,
      [
        dados.nome,
        dados.email,
        dados.senhaHash,
        dados.cpf,
        dados.salario,
        dados.datanascimento,
        id,
      ]
    );
    await conexao.execute(
      `UPDATE contas_acesso
          SET email = ?, senha = ?
        WHERE id_usuario = ? AND papel = 'admin'`,
      [dados.email, dados.senhaHash, id]
    );

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function atualizarPerfilUsuario(
  id: number,
  dados: {
    nome: string;
    cpf: string;
    senhaHash?: string;
    salario: number;
    datanascimento: string;
  }
): Promise<void> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_usuario = ? AND papel = 'admin' FOR UPDATE`,
      [id]
    );
    if (contas.length !== 1) {
      throw new Error("Conta de acesso administrativa não encontrada");
    }

    await conexao.execute(
      `UPDATE usuario
          SET nome = ?, cpf = ?, salario = ?, datanascimento = ?
        WHERE id = ?`,
      [dados.nome, dados.cpf, dados.salario, dados.datanascimento, id]
    );
    if (dados.senhaHash) {
      await conexao.execute(
        `UPDATE usuario SET senha = ? WHERE id = ?`,
        [dados.senhaHash, id]
      );
      await conexao.execute(
        `UPDATE contas_acesso SET senha = ?
          WHERE id_usuario = ? AND papel = 'admin'`,
        [dados.senhaHash, id]
      );
    }

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}


export async function desativarUsuario(id: number): Promise<void> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_usuario = ? AND papel = 'admin' FOR UPDATE`,
      [id]
    );
    if (contas.length !== 1) {
      throw new Error("Conta de acesso administrativa não encontrada");
    }

    await conexao.execute(
      "UPDATE usuario SET ativo = 'Não' WHERE id = ?",
      [id]
    );
    await conexao.execute(
      `UPDATE contas_acesso
          SET ativo = 'Não'
        WHERE id_usuario = ? AND papel = 'admin'`,
      [id]
    );

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}