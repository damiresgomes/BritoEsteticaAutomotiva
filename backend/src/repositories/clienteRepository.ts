import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { Cliente } from "../entities/cliente";

export type StatusCliente = "Sim" | "Não";

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
  ativo: StatusCliente;
}

interface ClienteRow extends RowDataPacket, ContaCliente {}

export interface ClientePublico {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  ativo: StatusCliente;
}

function mapearCliente(row: ClienteRow): Cliente {
  return new Cliente(row.id_cliente, row.nome, row.telefone ?? "");
}

export async function buscarContaClientePorEmail(email: string): Promise<ContaCliente | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function buscarContaClientePorId(id: number): Promise<ClientePublico | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE id_cliente = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  return row ? { id: row.id_cliente, nome: row.nome, email: row.email, telefone: row.telefone, ativo: row.ativo } : null;
}

export async function criarCliente(cliente: NovoCliente): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO clientes (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)",
    [cliente.nome, cliente.email, cliente.senhaHash, cliente.telefone]
  );
  return resultado.insertId;
}

export async function buscarPorId(id_cliente: number): Promise<Cliente | null> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE id_cliente = ? LIMIT 1",
    [id_cliente]
  );
  return rows[0] ? mapearCliente(rows[0]) : null;
}

export async function buscarClientes(): Promise<Cliente[]> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes ORDER BY nome"
  );
  return rows.map(mapearCliente);
}

export async function buscarClientesPorNome(nome: string): Promise<Cliente[]> {
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, ativo FROM clientes WHERE nome LIKE CONCAT('%', ?, '%') ORDER BY nome",
    [nome]
  );
  return rows.map(mapearCliente);
}

export async function atualizarCliente(id_cliente: number, cliente: Pick<NovoCliente, "nome" | "email" | "telefone">): Promise<number> {
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
