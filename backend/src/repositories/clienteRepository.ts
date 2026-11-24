import { pool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Cliente } from "../entities/cliente";

// Declara a interface 'NovoCliente' para definir o contrato/forma de dados em TypeScript.
export interface NovoCliente {
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string | null;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string;
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: string;
}

// Declara a interface 'ContaCliente' para definir o contrato/forma de dados em TypeScript.
export interface ContaCliente {
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number;
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string | null;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string | null;
  // Define a propriedade/campo 'senha_hash' no objeto/estrutura.
  senha_hash: string | null;
  cpf?: string | null;
  // Define a propriedade/campo 'ativo' no objeto/estrutura.
  ativo: string;
}

interface ClienteRow extends RowDataPacket, ContaCliente {}

// Cria a constante local 'SELECT_CLIENTE_COM_CONTA'; usar const evita reatribuição acidental.
const SELECT_CLIENTE_COM_CONTA = `
  SELECT c.id_cliente, c.nome, c.telefone, c.senha_hash, c.cpf, c.ativo,
         ca.email AS email
  FROM clientes c
  LEFT JOIN contas_acesso ca ON ca.id_cliente = c.id_cliente AND ca.papel = 'cliente'
`;

// Declara a função local 'mapearCliente'(row: ClienteRow) para encapsular lógica reutilizável neste arquivo.
function mapearCliente(row: ClienteRow): Cliente {
  return new Cliente(
    row.id_cliente,
    row.nome,
    row.email ?? "sem-email",
    row.telefone ?? "",
    // Atribui valor: row.ativo === "Sim",.
    row.ativo === "Sim",
    row.senha_hash ?? undefined,
    row.cpf ?? undefined
  );
}

// Exporta a função assíncrona 'buscarContaClientePorEmail'(email: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarContaClientePorEmail(email: string): Promise<Cliente | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<ClienteRow[]>(
    "SELECT id_cliente, nome, email, telefone, senha_hash, cpf, ativo FROM clientes WHERE email = ? LIMIT 1",
    [email]
  );
  if (rows.length === 0) return null;
  // Retorna mapearCliente(rows[0]) para quem chamou esta função.
  return mapearCliente(rows[0]);
}

// Exporta a função assíncrona 'buscarContaClientePorId'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarContaClientePorId(id: number): Promise<Cliente | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<ClienteRow[]>(
    `${SELECT_CLIENTE_COM_CONTA} WHERE c.id_cliente = ? LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  // Retorna mapearCliente(rows[0]) para quem chamou esta função.
  return mapearCliente(rows[0]);
}

// Exporta a função assíncrona 'criarCliente'(cliente: NovoCliente); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarCliente(cliente: NovoCliente): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO clientes (nome, email, senha_hash, telefone, cpf, ativo) VALUES (?, ?, ?, ?, ?, 'Sim')",
    [cliente.nome, cliente.email, cliente.senhaHash, cliente.telefone, cliente.cpf]
  );
  // Retorna resultado.insertId para quem chamou esta função.
  return resultado.insertId;
}

// Exporta a função assíncrona 'buscarPorId'(id_cliente: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarPorId(id_cliente: number): Promise<Cliente | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<ClienteRow[]>(
    `${SELECT_CLIENTE_COM_CONTA} WHERE c.id_cliente = ? LIMIT 1`,
    [id_cliente]
  );
  if (rows.length === 0) return null;
  // Retorna mapearCliente(rows[0]) para quem chamou esta função.
  return mapearCliente(rows[0]);
}

export async function buscarClientes(
  limite?: number,
  offset?: number
): Promise<{ clientes: Cliente[]; total: number }> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM clientes"
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = "SELECT id_cliente, nome, email, telefone, senha_hash, cpf, ativo FROM clientes ORDER BY nome";
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<ClienteRow[]>(query, params);
  // Cria a constante local 'clientes'; usar const evita reatribuição acidental.
  const clientes = rows.map(mapearCliente);

  // Retorna { clientes, total } para quem chamou esta função.
  return { clientes, total };
}

export async function atualizarCliente(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'cliente' no objeto/estrutura.
  cliente: { nome: string; email: string; telefone: string }
): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id_cliente = ?",
    [cliente.nome, cliente.email, cliente.telefone, id_cliente]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

export async function atualizarCadastroCliente(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'cliente' no objeto/estrutura.
  cliente: { nome: string; senhaHash?: string; telefone: string; cpf: string }
): Promise<number> {
  // Cria a constante local 'alterarSenha'; usar const evita reatribuição acidental.
  const alterarSenha = Boolean(cliente.senhaHash);
  // Cria a constante local 'query'; usar const evita reatribuição acidental.
  const query = alterarSenha
    ? "UPDATE clientes SET nome = ?, senha_hash = ?, telefone = ?, cpf = ? WHERE id_cliente = ?"
    : "UPDATE clientes SET nome = ?, telefone = ?, cpf = ? WHERE id_cliente = ?";
  const valores: (string | number)[] = alterarSenha
    ? [cliente.nome, cliente.senhaHash ?? "", cliente.telefone, cliente.cpf, id_cliente]
    : [cliente.nome, cliente.telefone, cliente.cpf, id_cliente];

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(query, valores);
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

export async function atualizarSenhaContaCliente(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string
): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE contas_acesso SET senha = ? WHERE id_cliente = ? AND papel = 'cliente'",
    [senhaHash, id_cliente]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'desativarCliente'(id_cliente: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function desativarCliente(id_cliente: number): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET ativo = 'Não' WHERE id_cliente = ?",
    [id_cliente]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Declara o alias de tipo 'StatusCliente' para nomear uma estrutura de tipo reutilizável.
export type StatusCliente = "Ativo" | "Inativo" | "Sem conta";

// Declara a interface 'ClienteAdmin' para definir o contrato/forma de dados em TypeScript.
export interface ClienteAdmin extends RowDataPacket {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  cpf?: string | null;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string | null;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string | null;
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: StatusCliente;
  // Define a propriedade/campo 'contaId' no objeto/estrutura.
  contaId: number | null;
}

// Declara a interface 'DadosClienteAdmin' para definir o contrato/forma de dados em TypeScript.
export interface DadosClienteAdmin {
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  cpf?: string | null;
  // Define a propriedade/campo 'telefone' no objeto/estrutura.
  telefone: string;
  senhaHash?: string;
}

interface NovoClienteAdmin extends Omit<DadosClienteAdmin, "senhaHash"> {
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
}

// Cria a constante local 'SELECT_CLIENTES'; usar const evita reatribuição acidental.
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

export async function listarClientesAdmin(
  limite?: number,
  offset?: number
): Promise<ClienteAdmin[]> {
  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `${SELECT_CLIENTES} ORDER BY c.nome, c.id_cliente`;
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [clientes] = await pool.execute<ClienteAdmin[]>(query, params);
  // Retorna clientes para quem chamou esta função.
  return clientes;
}

// Exporta a função assíncrona 'contarClientesAdmin'(); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function contarClientesAdmin(): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM clientes"
  );
  // Retorna Number(totalRow?.total || 0) para quem chamou esta função.
  return Number(totalRow?.total || 0);
}

// Exporta a função assíncrona 'buscarClienteAdmin'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarClienteAdmin(id: number): Promise<ClienteAdmin | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [clientes] = await pool.execute<ClienteAdmin[]>(
    `${SELECT_CLIENTES} WHERE c.id_cliente = ? LIMIT 1`,
    [id]
  );
  // Retorna clientes[0] ?? null para quem chamou esta função.
  return clientes[0] ?? null;
}

export async function criarClienteAdmin(
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: NovoClienteAdmin
): Promise<number | "email-em-uso"> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    const [contasExistentes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id FROM contas_acesso WHERE email = ? LIMIT 1 FOR UPDATE",
      [dados.email]
    );
    // Condição: se 'contasExistentes.length' for verdadeira, o bloco abaixo é executado.
    if (contasExistentes.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "email-em-uso" para quem chamou esta função.
      return "email-em-uso";
    }

    const [cliente] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, telefone, cpf) VALUES (?, ?, ?)",
      [dados.nome, dados.telefone, dados.cpf ?? null]
    );
    // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
    await conexao.execute<ResultSetHeader>(
      `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
       VALUES (?, ?, 'cliente', 'Sim', ?)`,
      [dados.email, dados.senhaHash, cliente.insertId]
    );
    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
    // Retorna cliente.insertId para quem chamou esta função.
    return cliente.insertId;
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

export async function atualizarClienteAdmin(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: DadosClienteAdmin
): Promise<"atualizado" | "nao-encontrado" | "senha-obrigatoria" | "email-em-uso"> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    const [clientes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? FOR UPDATE",
      [id]
    );
    // Condição: se '!clientes.length' for verdadeira, o bloco abaixo é executado.
    if (!clientes.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "nao-encontrado" para quem chamou esta função.
      return "nao-encontrado";
    }

    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_cliente = ? AND papel = 'cliente' FOR UPDATE`,
      [id]
    );
    // Condição: se '!contas.length && !dados.senhaHash' for verdadeira, o bloco abaixo é executado.
    if (!contas.length && !dados.senhaHash) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "senha-obrigatoria" para quem chamou esta função.
      return "senha-obrigatoria";
    }

    const [contasComEmail] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE email = ? AND (id_cliente IS NULL OR id_cliente <> ?)
        LIMIT 1 FOR UPDATE`,
      [dados.email, id]
    );
    // Condição: se 'contasComEmail.length' for verdadeira, o bloco abaixo é executado.
    if (contasComEmail.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "email-em-uso" para quem chamou esta função.
      return "email-em-uso";
    }

    // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
    await conexao.execute<ResultSetHeader>(
      "UPDATE clientes SET nome = ?, cpf = ?, telefone = ? WHERE id_cliente = ?",
      [dados.nome, dados.cpf ?? null, dados.telefone, id]
    );

    // Condição: se 'contas.length' for verdadeira, o bloco abaixo é executado.
    if (contas.length) {
      // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
      await conexao.execute<ResultSetHeader>(
        "UPDATE contas_acesso SET email = ? WHERE id = ?",
        [dados.email, contas[0].id]
      );
      // Condição: se 'dados.senhaHash' for verdadeira, o bloco abaixo é executado.
      if (dados.senhaHash) {
        // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
        await conexao.execute<ResultSetHeader>(
          "UPDATE contas_acesso SET senha = ? WHERE id = ?",
          [dados.senhaHash, contas[0].id]
        );
      }
    } else {
      // Condição: se '!dados.senhaHash' for verdadeira, o bloco abaixo é executado.
      if (!dados.senhaHash) {
        // Aguarda conclusão da operação assíncrona: conexao.rollback();.
        await conexao.rollback();
        // Retorna "senha-obrigatoria" para quem chamou esta função.
        return "senha-obrigatoria";
      }
      // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
      await conexao.execute<ResultSetHeader>(
        `INSERT INTO contas_acesso (email, senha, papel, ativo, id_cliente)
         VALUES (?, ?, 'cliente', 'Sim', ?)`,
        [dados.email, dados.senhaHash, id]
      );
    }

    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
    // Retorna "atualizado" para quem chamou esta função.
    return "atualizado";
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

export async function desativarClienteAdmin(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number
): Promise<"desativado" | "removido" | "nao-encontrado" | "historico-sem-conta"> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    const [clientes] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ? FOR UPDATE",
      [id]
    );
    // Condição: se '!clientes.length' for verdadeira, o bloco abaixo é executado.
    if (!clientes.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "nao-encontrado" para quem chamou esta função.
      return "nao-encontrado";
    }

    const [contas] = await conexao.execute<RowDataPacket[]>(
      `SELECT id FROM contas_acesso
        WHERE id_cliente = ? AND papel = 'cliente' FOR UPDATE`,
      [id]
    );
    // Condição: se 'contas.length' for verdadeira, o bloco abaixo é executado.
    if (contas.length) {
      // Aguarda conclusão da operação assíncrona: conexao.execute(.
      await conexao.execute(
        "UPDATE contas_acesso SET ativo = 'Não' WHERE id = ?",
        [contas[0].id]
      );
      // Aguarda conclusão da operação assíncrona: conexao.commit();.
      await conexao.commit();
      // Retorna "desativado" para quem chamou esta função.
      return "desativado";
    }

    const [agendamentos] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_agendamento FROM agendamentos WHERE id_cliente = ? LIMIT 1",
      [id]
    );
    // Condição: se 'agendamentos.length' for verdadeira, o bloco abaixo é executado.
    if (agendamentos.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "historico-sem-conta" para quem chamou esta função.
      return "historico-sem-conta";
    }

    // Aguarda conclusão da operação assíncrona: conexao.execute("DELETE FROM clientes WHERE id_cliente = ?", [id]);.
    await conexao.execute("DELETE FROM clientes WHERE id_cliente = ?", [id]);
    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
    // Retorna "removido" para quem chamou esta função.
    return "removido";
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

// Exporta a função assíncrona 'reativarClienteAdmin'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function reativarClienteAdmin(id: number): Promise<boolean> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE contas_acesso SET ativo = 'Sim'
      WHERE id_cliente = ? AND papel = 'cliente'`,
    [id]
  );
  // Retorna resultado.affectedRows > 0 para quem chamou esta função.
  return resultado.affectedRows > 0;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Camada SQL de clientes: busca, cadastro, atualização e consultas usadas por auth/admin.
