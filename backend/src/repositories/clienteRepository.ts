import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
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
