import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export type PapelConta = "cliente" | "admin";
export type EstadoConta = "Sim" | "Não";

export interface ContaAcesso extends RowDataPacket {
  id: number;
  email: string;
  senhaHash: string;
  papel: PapelConta;
  ativo: EstadoConta;
  clienteId: number | null;
  usuarioId: number | null;
  nome: string;
  telefone: string | null;
  usuarioAtivo: EstadoConta | null;
}

const COLUNAS_CONTA = `
  ca.id,
  ca.email,
  ca.senha AS senhaHash,
  ca.papel,
  ca.ativo,
  ca.id_cliente AS clienteId,
  ca.id_usuario AS usuarioId,
  COALESCE(c.nome, u.nome) AS nome,
  c.telefone AS telefone,
  u.ativo AS usuarioAtivo
`;

export async function buscarContaPorEmail(email: string): Promise<ContaAcesso | null> {
  const [contas] = await pool.execute<ContaAcesso[]>(
    `SELECT ${COLUNAS_CONTA}
       FROM contas_acesso ca
       LEFT JOIN clientes c ON c.id_cliente = ca.id_cliente
       LEFT JOIN usuario u ON u.id = ca.id_usuario
      WHERE ca.email = ?
      LIMIT 1`,
    [email]
  );

  return contas[0] ?? null;
}

export async function buscarContaPorId(id: number): Promise<ContaAcesso | null> {
  const [contas] = await pool.execute<ContaAcesso[]>(
    `SELECT ${COLUNAS_CONTA}
       FROM contas_acesso ca
       LEFT JOIN clientes c ON c.id_cliente = ca.id_cliente
       LEFT JOIN usuario u ON u.id = ca.id_usuario
      WHERE ca.id = ?
      LIMIT 1`,
    [id]
  );

  return contas[0] ?? null;
}

export async function emailEmUso(email: string, ignorarUsuarioId?: number): Promise<boolean> {
  const exclusao = ignorarUsuarioId === undefined
    ? ""
    : " AND (id_usuario IS NULL OR id_usuario <> ?)";
  const parametros = ignorarUsuarioId === undefined
    ? [email]
    : [email, ignorarUsuarioId];
  const [contas] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM contas_acesso WHERE email = ?${exclusao} LIMIT 1`,
    parametros
  );

  return contas.length > 0;
}

export interface NovoClienteComConta {
  nome: string;
  email: string;
  senhaHash: string;
  telefone: string;
}

export async function criarClienteComConta(dados: NovoClienteComConta): Promise<{
  contaId: number;
  clienteId: number;
}> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [cliente] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, telefone) VALUES (?, ?)",
      [dados.nome, dados.telefone]
    );
    const [conta] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
       VALUES (?, ?, 'cliente', 'Sim', ?)`,
      [dados.email, dados.senhaHash, cliente.insertId]
    );

    await conexao.commit();
    return { contaId: conta.insertId, clienteId: cliente.insertId };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
