import { pool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Cliente } from "../entities/cliente";

export interface NovoCliente {
  nome: string;
  email: string | null;
  senhaHash: string;
  telefone: string;
}

export interface ContaCliente {
  id_cliente: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  senha_hash: string | null;
  ativo: string;
}

interface ClienteRow extends RowDataPacket, ContaCliente {}

function mapearCliente(row: ClienteRow): Cliente {
  return new Cliente(
    row.id_cliente,
    row.nome,
    row.email ?? "",
    row.telefone ?? "",
    row.ativo === "Sim",
    row.senha_hash ?? undefined
  );
}

export async function buscarContaClientePorEmail(email: string): Promise<Cliente | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE email = ? LIMIT 1",
    [email]
  );
  if (rows.length === 0) return null;
  return mapearCliente(rows[0]);
}

export async function buscarContaClientePorId(id: number): Promise<Cliente | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE id_cliente = ? LIMIT 1",
    [id]
  );
  if (rows.length === 0) return null;
  return mapearCliente(rows[0]);
}

export async function criarCliente(cliente: NovoCliente): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO clientes (nome, email, senha_hash, telefone, ativo) VALUES (?, ?, ?, ?, 'Sim')",
    [cliente.nome, cliente.email, cliente.senhaHash, cliente.telefone]
  );
  return resultado.insertId;
}

export async function buscarPorId(id_cliente: number): Promise<Cliente | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE id_cliente = ? LIMIT 1",
    [id_cliente]
  );
  if (rows.length === 0) return null;
  return mapearCliente(rows[0]);
}

export async function buscarClientes(
  limite?: number,
  offset?: number
): Promise<{ clientes: Cliente[]; total: number }> {
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM clientes"
  );
  const total = Number(totalRow?.total || 0);

  let query = "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes ORDER BY nome";
  const params: number[] = [];

  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);
  }

  const [rows] = await pool.execute<ClienteRow[]>(query, params);
  const clientes = rows.map(mapearCliente);

  return { clientes, total };
}

export async function atualizarCliente(
  id_cliente: number,
  cliente: { nome: string; email: string; telefone: string }
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id_cliente = ?",
    [cliente.nome, cliente.email, cliente.telefone, id_cliente]
  );
  return resultado.affectedRows;
}

export async function atualizarCadastroCliente(
  id_cliente: number,
  cliente: { nome: string; senhaHash: string; telefone: string }
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET nome = ?, senha_hash = ?, telefone = ? WHERE id_cliente = ?",
    [cliente.nome, cliente.senhaHash, cliente.telefone, id_cliente]
  );
  return resultado.affectedRows;
}

export async function desativarCliente(id_cliente: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET ativo = 'Não' WHERE id_cliente = ?",
    [id_cliente]
  );
  return resultado.affectedRows;
}

export type StatusCliente = "Ativo" | "Inativo" | "Sem conta";

export interface ClienteAdmin extends RowDataPacket {
  id: number;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  status: StatusCliente;
  contaId: number | null;
}

export interface DadosClienteAdmin {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senhaHash?: string;
}

interface NovoClienteAdmin extends Omit<DadosClienteAdmin, "senhaHash"> {
  senhaHash: string;
}

const SELECT_CLIENTES = `
  SELECT c.id_cliente AS id,
         c.nome,
         c.cpf,
         ca.email,
         c.telefone,
         CASE
           WHEN ca.id IS NULL THEN 'Sem conta'
           WHEN ca.ativo = 'Sim' THEN 'Ativo'
           ELSE 'Inativo'
         END AS status,
         ca.id AS contaId
    FROM clientes c
    LEFT JOIN contas_acesso ca
      ON ca.id_cliente = c.id_cliente AND ca.papel = 'cliente'
`;

export async function listarClientesAdmin(): Promise<ClienteAdmin[]> {
  const [clientes] = await pool.execute<ClienteAdmin[]>(
    `${SELECT_CLIENTES} ORDER BY c.nome, c.id_cliente`
  );
  return clientes;
}

export async function buscarClienteAdmin(id: number): Promise<ClienteAdmin | null> {
  const [clientes] = await pool.execute<ClienteAdmin[]>(
    `${SELECT_CLIENTES} WHERE c.id_cliente = ? LIMIT 1`,
    [id]
  );
  return clientes[0] ?? null;
}

export async function criarClienteAdmin(
  dados: NovoClienteAdmin
): Promise<number | "email-em-uso"> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [contasExistentes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id FROM contas_acesso WHERE email = ? LIMIT 1 FOR UPDATE",
      [dados.email]
    );
    if (contasExistentes.length) {
      await conexao.rollback();
      return "email-em-uso";
    }

    const [cliente] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, telefone, cpf) VALUES (?, ?, ?)",
      [dados.nome, dados.telefone, dados.cpf]
    );
    await conexao.execute<ResultSetHeader>(
      `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
       VALUES (?, ?, 'cliente', 'Sim', ?)`,
      [dados.email, dados.senhaHash, cliente.insertId]
    );
    await conexao.commit();
    return cliente.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function atualizarClienteAdmin(
  id: number,
  dados: DadosClienteAdmin
): Promise<"atualizado" | "nao-encontrado" | "senha-obrigatoria" | "email-em-uso"> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [clientes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? FOR UPDATE",
      [id]
    );
    if (!clientes.length) {
      await conexao.rollback();
      return "nao-encontrado";
    }

    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_cliente = ? AND papel = 'cliente' FOR UPDATE`,
      [id]
    );
    if (!contas.length && !dados.senhaHash) {
      await conexao.rollback();
      return "senha-obrigatoria";
    }

    const [contasComEmail] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE email = ? AND (id_cliente IS NULL OR id_cliente <> ?)
        LIMIT 1 FOR UPDATE`,
      [dados.email, id]
    );
    if (contasComEmail.length) {
      await conexao.rollback();
      return "email-em-uso";
    }

    await conexao.execute<ResultSetHeader>(
      "UPDATE clientes SET nome = ?, cpf = ?, telefone = ? WHERE id_cliente = ?",
      [dados.nome, dados.cpf, dados.telefone, id]
    );

    if (contas.length) {
      await conexao.execute<ResultSetHeader>(
        "UPDATE contas_acesso SET email = ? WHERE id = ?",
        [dados.email, contas[0].id]
      );
      if (dados.senhaHash) {
        await conexao.execute<ResultSetHeader>(
          "UPDATE contas_acesso SET senha = ? WHERE id = ?",
          [dados.senhaHash, contas[0].id]
        );
      }
    } else {
      if (!dados.senhaHash) {
        await conexao.rollback();
        return "senha-obrigatoria";
      }
      await conexao.execute<ResultSetHeader>(
        `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
         VALUES (?, ?, 'cliente', 'Sim', ?)`,
        [dados.email, dados.senhaHash, id]
      );
    }

    await conexao.commit();
    return "atualizado";
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function desativarClienteAdmin(
  id: number
): Promise<"desativado" | "removido" | "nao-encontrado" | "historico-sem-conta"> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [clientes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? FOR UPDATE",
      [id]
    );
    if (!clientes.length) {
      await conexao.rollback();
      return "nao-encontrado";
    }

    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_cliente = ? AND papel = 'cliente' FOR UPDATE`,
      [id]
    );
    if (contas.length) {
      await conexao.execute(
        "UPDATE contas_acesso SET ativo = 'Não' WHERE id = ?",
        [contas[0].id]
      );
      await conexao.commit();
      return "desativado";
    }

    const [agendamentos] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_agendamento FROM agendamentos WHERE id_cliente = ? LIMIT 1",
      [id]
    );
    if (agendamentos.length) {
      await conexao.rollback();
      return "historico-sem-conta";
    }

    await conexao.execute("DELETE FROM clientes WHERE id_cliente = ?", [id]);
    await conexao.commit();
    return "removido";
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function reativarClienteAdmin(id: number): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE contas_acesso SET ativo = 'Sim'
      WHERE id_cliente = ? AND papel = 'cliente'`,
    [id]
  );
  return resultado.affectedRows > 0;
}