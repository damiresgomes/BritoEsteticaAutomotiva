import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Servico } from "../entities/servico";

// Declara a interface 'NovoServico' para definir o contrato/forma de dados em TypeScript.
export interface NovoServico {
  // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
  nome_servico: string;
  // Define a propriedade/campo 'descricao' no objeto/estrutura.
  descricao: string;
  // Define a propriedade/campo 'preco' no objeto/estrutura.
  preco: number;
  // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
  duracao_horas: number;
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: number;
}

interface ServicoRow extends RowDataPacket {
  // Define a propriedade/campo 'id_servico' no objeto/estrutura.
  id_servico: number;
  // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
  nome_servico: string;
  // Define a propriedade/campo 'descricao' no objeto/estrutura.
  descricao: string;
  // Define a propriedade/campo 'preco' no objeto/estrutura.
  preco: number;
  // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
  duracao_horas: number;
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: number;
}

// Cria a constante local 'COLUNAS'; usar const evita reatribuição acidental.
const COLUNAS = "id_servico, nome_servico, descricao, preco, duracao_horas, id_categoria";

// Declara a função local 'mapearServico'(row: ServicoRow) para encapsular lógica reutilizável neste arquivo.
function mapearServico(row: ServicoRow): Servico {
  return new Servico(
    row.id_servico,
    row.nome_servico,
    row.descricao,
    // Executa: Number(row.preco),.
    Number(row.preco),
    // Executa: Number(row.duracao_horas),.
    Number(row.duracao_horas),
    row.id_categoria
  );
}

// Exporta a função assíncrona 'buscarServico'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarServico(id: number): Promise<Servico | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicos] = await pool.execute<ServicoRow[]>(
    `SELECT ${COLUNAS} FROM servicos WHERE id_servico = ? LIMIT 1`,
    [id]
  );
  if (servicos.length === 0) return null;
  // Retorna mapearServico(servicos[0]) para quem chamou esta função.
  return mapearServico(servicos[0]);
}

// Exporta a função assíncrona 'buscarServicoPorNomeExato'(nome: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarServicoPorNomeExato(nome: string): Promise<Servico | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicos] = await pool.execute<ServicoRow[]>(
    `SELECT ${COLUNAS} FROM servicos WHERE nome_servico = ? LIMIT 1`,
    [nome]
  );
  if (servicos.length === 0) return null;
  // Retorna mapearServico(servicos[0]) para quem chamou esta função.
  return mapearServico(servicos[0]);
}

// Declara a interface 'FiltrosServico' para definir o contrato/forma de dados em TypeScript.
export interface FiltrosServico {
  nome?: string;
  id_categoria?: number;
  id_servico?: number;
  limite?: number;
  offset?: number;
}

// Exporta a função assíncrona 'listarServicos'(filtros: FiltrosServico = {}); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function listarServicos(filtros: FiltrosServico = {}): Promise<{ servicos: Servico[]; total: number }> {
  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  // Condição: se 'filtros.nome' for verdadeira, o bloco abaixo é executado.
  if (filtros.nome) {
    // Executa: whereClauses.push("nome_servico LIKE CONCAT('%', ?, '%')");.
    whereClauses.push("nome_servico LIKE CONCAT('%', ?, '%')");
    // Executa: params.push(filtros.nome);.
    params.push(filtros.nome);
  }

  // Condição: se 'filtros.id_categoria !== undefined' for verdadeira, o bloco abaixo é executado.
  if (filtros.id_categoria !== undefined) {
    // Executa: whereClauses.push("id_categoria = ?");.
    whereClauses.push("id_categoria = ?");
    // Executa: params.push(filtros.id_categoria);.
    params.push(filtros.id_categoria);
  }

  // Condição: se 'filtros.id_servico !== undefined' for verdadeira, o bloco abaixo é executado.
  if (filtros.id_servico !== undefined) {
    // Executa: whereClauses.push("id_servico = ?");.
    whereClauses.push("id_servico = ?");
    // Executa: params.push(filtros.id_servico);.
    params.push(filtros.id_servico);
  }

  // Cria a constante local 'whereSql'; usar const evita reatribuição acidental.
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM servicos ${whereSql}`,
    params
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `SELECT ${COLUNAS} FROM servicos ${whereSql} ORDER BY nome_servico`;
  // Cria a constante local 'queryParams'; usar const evita reatribuição acidental.
  const queryParams = [...params];

  // Condição: se 'filtros.limite !== undefined && filtros.offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (filtros.limite !== undefined && filtros.offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: queryParams.push(filtros.limite, filtros.offset);.
    queryParams.push(filtros.limite, filtros.offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<ServicoRow[]>(query, queryParams);
  // Cria a constante local 'servicos'; usar const evita reatribuição acidental.
  const servicos = rows.map(mapearServico);

  // Retorna { servicos, total } para quem chamou esta função.
  return { servicos, total };
}

// Exporta a função assíncrona 'criarServico'(servico: NovoServico); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarServico(servico: NovoServico): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO servicos (nome_servico, descricao, preco, duracao_horas, id_categoria) VALUES (?, ?, ?, ?, ?)`,
    [
      servico.nome_servico,
      servico.descricao,
      servico.preco,
      servico.duracao_horas,
      servico.id_categoria,
    ]
  );
  // Retorna resultado.insertId para quem chamou esta função.
  return resultado.insertId;
}

// Exporta a função assíncrona 'atualizarServico'(id_servico: number, servico: NovoServico); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarServico(id_servico: number, servico: NovoServico): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE servicos SET nome_servico = ?, descricao = ?, preco = ?, duracao_horas = ?, id_categoria = ? WHERE id_servico = ?`,
    [
      servico.nome_servico,
      servico.descricao,
      servico.preco,
      servico.duracao_horas,
      servico.id_categoria,
      id_servico,
    ]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'excluirServico'(id_servico: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function excluirServico(id_servico: number): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `DELETE FROM servicos WHERE id_servico = ?`,
    [id_servico]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'buscarServicosPorIds'(ids: number[]); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarServicosPorIds(ids: number[]): Promise<Servico[]> {
  if (ids.length === 0) return [];
  // Cria a constante local 'marcadores'; usar const evita reatribuição acidental.
  const marcadores = ids.map(() => "?").join(", ");
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicos] = await pool.execute<ServicoRow[]>(
    `SELECT ${COLUNAS} FROM servicos WHERE id_servico IN (${marcadores})`,
    ids
  );
  // Retorna servicos.map(mapearServico) para quem chamou esta função.
  return servicos.map(mapearServico);
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Camada SQL de serviços: consultas, paginação e persistência.
