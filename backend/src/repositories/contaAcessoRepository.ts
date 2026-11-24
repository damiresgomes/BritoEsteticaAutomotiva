import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

// Declara o alias de tipo 'PapelConta' para nomear uma estrutura de tipo reutilizável.
export type PapelConta = "cliente" | "admin";
// Declara o alias de tipo 'EstadoConta' para nomear uma estrutura de tipo reutilizável.
export type EstadoConta = "Sim" | "Não";

// Declara a interface 'ContaAcesso' para definir o contrato/forma de dados em TypeScript.
export interface ContaAcesso extends RowDataPacket {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'papel' no objeto/estrutura.
  papel: PapelConta;
  // Define a propriedade/campo 'ativo' no objeto/estrutura.
  ativo: EstadoConta;
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: number | null;
  // Define a propriedade/campo 'usuarioId' no objeto/estrutura.
  usuarioId: number | null;
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string | null;
  // Define a propriedade/campo 'usuarioAtivo' no objeto/estrutura.
  usuarioAtivo: EstadoConta | null;
  // Define a propriedade/campo 'usuarioSalario' no objeto/estrutura.
  usuarioSalario: number | null;
  // Define a propriedade/campo 'usuarioDataNascimento' no objeto/estrutura.
  usuarioDataNascimento: string | null;
  // Define a propriedade/campo 'usuarioCpf' no objeto/estrutura.
  usuarioCpf: string | null;
}

// Cria a constante local 'COLUNAS_CONTA'; usar const evita reatribuição acidental.
const COLUNAS_CONTA = `
  ca.id,
  ca.email,
  ca.senha AS senhaHash,
  ca.papel,
  ca.ativo,
  ca.id_cliente AS clienteId,
  ca.id_usuario AS usuarioId,
  // Executa: COALESCE(c.nome, u.nome) AS nome,.
  COALESCE(c.nome, u.nome) AS nome,
  c.telefone AS telefone,
  u.ativo AS usuarioAtivo,
  u.salario AS usuarioSalario,
  u.datanascimento AS usuarioDataNascimento,
  u.cpf AS usuarioCpf
`;

// Exporta a função assíncrona 'buscarContaPorEmail'(email: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarContaPorEmail(email: string): Promise<ContaAcesso | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [contas] = await pool.execute<ContaAcesso[]>(
    `SELECT ${COLUNAS_CONTA}
       FROM contas_acesso ca
       LEFT JOIN clientes c ON c.id_cliente = ca.id_cliente
       LEFT JOIN usuario u ON u.id = ca.id_usuario
      WHERE ca.email = ?
      LIMIT 1`,
    [email]
  );

  // Retorna contas[0] ?? null para quem chamou esta função.
  return contas[0] ?? null;
}

// Exporta a função assíncrona 'buscarContaPorId'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarContaPorId(id: number): Promise<ContaAcesso | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [contas] = await pool.execute<ContaAcesso[]>(
    `SELECT ${COLUNAS_CONTA}
       FROM contas_acesso ca
       LEFT JOIN clientes c ON c.id_cliente = ca.id_cliente
       LEFT JOIN usuario u ON u.id = ca.id_usuario
      WHERE ca.id = ?
      LIMIT 1`,
    [id]
  );

  // Retorna contas[0] ?? null para quem chamou esta função.
  return contas[0] ?? null;
}

// Exporta a função assíncrona 'emailEmUso'(email: string, ignorarUsuarioId?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function emailEmUso(email: string, ignorarUsuarioId?: number): Promise<boolean> {
  // Cria a constante local 'exclusao'; usar const evita reatribuição acidental.
  const exclusao = ignorarUsuarioId === undefined
    ? ""
    : " AND (id_usuario IS NULL OR id_usuario <> ?)";
  // Cria a constante local 'parametros'; usar const evita reatribuição acidental.
  const parametros = ignorarUsuarioId === undefined
    ? [email]
    : [email, ignorarUsuarioId];
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [contas] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM contas_acesso WHERE email = ?${exclusao} LIMIT 1`,
    parametros
  );

  // Retorna contas.length > 0 para quem chamou esta função.
  return contas.length > 0;
}

// Declara a interface 'NovoClienteComConta' para definir o contrato/forma de dados em TypeScript.
export interface NovoClienteComConta {
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string;
  cpf?: string | null;
}

// Exporta a função assíncrona 'criarClienteComConta'(dados: NovoClienteComConta); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarClienteComConta(dados: NovoClienteComConta): Promise<{
  // Define a propriedade/campo 'contaId' no objeto/estrutura.
  contaId: number;
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: number;
}> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();

    const [cliente] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, telefone, cpf) VALUES (?, ?, ?)",
      [dados.nome, dados.telefone, dados.cpf ?? null]
    );
    const [conta] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
       VALUES (?, ?, 'cliente', 'Sim', ?)`,
      [dados.email, dados.senhaHash, cliente.insertId]
    );

    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
    // Retorna { contaId: conta.insertId, clienteId: cliente.insertId } para quem chamou esta função.
    return { contaId: conta.insertId, clienteId: cliente.insertId };
  } catch (erro) {
    // Aguarda conclusão da operação assíncrona: conexao.rollback();.
    await conexao.rollback();
    // Lança exceção/valor: erro;.
    throw erro;
  } finally {
    // Executa: conexao.release();.
    conexao.release();
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Camada SQL da conta unificada (contas_acesso): autenticação, vínculo cliente/usuário e criação de conta.
