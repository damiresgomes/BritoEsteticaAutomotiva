import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { CriarAgendamentoInput } from "../schemas/agendamentoSchema";
import { RequisicaoInvalidaError } from "../errors/AppError";
import { Agendamento, ServicoItemAgendado, StatusAgendamento } from "../entities/agendamento";
import { Carro } from "../entities/carro";

interface AgendamentoRow extends RowDataPacket {
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number;
  // Define a propriedade/campo 'data_hora' no objeto/estrutura.
  data_hora: string;
  // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
  placa_veiculo: string | null;
  // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
  modelo_veiculo: string | null;
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: StatusAgendamento;
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number;
  nome_cliente?: string;
}

interface AgendamentoServicoRow extends RowDataPacket {
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number;
  // Define a propriedade/campo 'id_servico' no objeto/estrutura.
  id_servico: number;
  // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
  nome_servico: string;
  // Define a propriedade/campo 'preco' no objeto/estrutura.
  preco: number;
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: number;
}

// Declara a função local 'converterDataHora'(valor: string) para encapsular lógica reutilizável neste arquivo.
function converterDataHora(valor: string): string {
  return new Date(valor).toLocaleString("sv-SE", {
    // Define a propriedade/campo 'timeZone' no objeto/estrutura.
    timeZone: "America/Sao_Paulo",
    // Define a propriedade/campo 'hour12' no objeto/estrutura.
    hour12: false,
  });
}

async function carregarServicos(
  // Define a propriedade/campo 'idsAgendamento' no objeto/estrutura.
  idsAgendamento: number[],
  // Define a propriedade/campo 'connection' no objeto/estrutura.
  connection: PoolConnection | typeof pool = pool
): Promise<Map<number, ServicoItemAgendado[]>> {
  // Cria a constante local 'agrupados'; usar const evita reatribuição acidental.
  const agrupados = new Map<number, ServicoItemAgendado[]>();
  if (idsAgendamento.length === 0) return agrupados;

  // Cria a constante local 'placeholders'; usar const evita reatribuição acidental.
  const placeholders = idsAgendamento.map(() => "?").join(",");
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await connection.execute<AgendamentoServicoRow[]>(
    `SELECT ags.id_agendamento, s.id_servico, s.nome_servico, s.preco, s.id_categoria
       FROM agendamento_servico ags
       JOIN servicos s ON s.id_servico = ags.id_servico
      WHERE ags.id_agendamento IN (${placeholders})
      ORDER BY s.nome_servico`,
    idsAgendamento
  );

  // Inicia laço for com 'const row of rows', repetindo o bloco para cada iteração.
  for (const row of rows) {
    // Cria a constante local 'lista'; usar const evita reatribuição acidental.
    const lista = agrupados.get(row.id_agendamento) ?? [];
    // Executa: lista.push({.
    lista.push({
      // Define a propriedade/campo 'id_servico' no objeto/estrutura.
      id_servico: row.id_servico,
      // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
      nome_servico: row.nome_servico,
      // Define a propriedade/campo 'preco' no objeto/estrutura.
      preco: Number(row.preco),
      // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
      id_categoria: Number(row.id_categoria),
    });
    // Executa: agrupados.set(row.id_agendamento, lista);.
    agrupados.set(row.id_agendamento, lista);
  }
  // Retorna agrupados para quem chamou esta função.
  return agrupados;
}

async function mapearAgendamentos(
  // Define a propriedade/campo 'rows' no objeto/estrutura.
  rows: AgendamentoRow[],
  // Define a propriedade/campo 'connection' no objeto/estrutura.
  connection: PoolConnection | typeof pool = pool
): Promise<Agendamento[]> {
  // Cria a constante local 'ids'; usar const evita reatribuição acidental.
  const ids = rows.map((row) => row.id_agendamento);
  // Cria a constante local 'servicosMap'; usar const evita reatribuição acidental.
  const servicosMap = await carregarServicos(ids, connection);

  return rows.map((row) => {
    // Cria a constante local 'carro'; usar const evita reatribuição acidental.
    const carro = new Carro(
      row.placa_veiculo ?? "SEM-PLACA",
      row.modelo_veiculo ?? "Não informado"
    );
    // Cria a constante local 'servicos'; usar const evita reatribuição acidental.
    const servicos = servicosMap.get(row.id_agendamento) ?? [];
    return new Agendamento(
      row.id_agendamento,
      row.data_hora,
      row.status,
      row.id_cliente,
      carro,
      servicos,
      row.nome_cliente
    );
  });
}

// Declara a função assíncrona local 'garantirServicosExistem'(connection: PoolConnection, idsServicos: number[]), usada internamente neste arquivo.
async function garantirServicosExistem(connection: PoolConnection, idsServicos: number[]): Promise<void> {
  // Cria a constante local 'placeholders'; usar const evita reatribuição acidental.
  const placeholders = idsServicos.map(() => "?").join(",");
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [servicosRows] = await connection.execute<RowDataPacket[]>(
    `SELECT id_servico FROM servicos WHERE id_servico IN (${placeholders})`,
    idsServicos
  );

  // Condição: se 'servicosRows.length !== idsServicos.length' for verdadeira, o bloco abaixo é executado.
  if (servicosRows.length !== idsServicos.length) {
    // Lança 'RequisicaoInvalidaError' com ("Um ou mais serviços selecionados não existem."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new RequisicaoInvalidaError("Um ou mais serviços selecionados não existem.");
  }
}

// Exporta a função assíncrona 'existeConflitoHorario'(dataHora: string, idIgnorado?: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function existeConflitoHorario(dataHora: string, idIgnorado?: number): Promise<boolean> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1 FROM agendamentos
      WHERE data_hora = ?
        AND status <> 'Cancelado'
        AND id_agendamento <> COALESCE(?, id_agendamento)
      LIMIT 1`,
    [converterDataHora(dataHora), idIgnorado ?? null]
  );

  // Retorna rows.length > 0 para quem chamou esta função.
  return rows.length > 0;
}

export async function criarAgendamento(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: CriarAgendamentoInput
): Promise<number> {
  // Cria a constante local 'connection'; usar const evita reatribuição acidental.
  const connection = await pool.getConnection();
  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: connection.beginTransaction();.
    await connection.beginTransaction();
    // Aguarda conclusão da operação assíncrona: garantirServicosExistem(connection, dados.servicos);.
    await garantirServicosExistem(connection, dados.servicos);

    // Cria a constante local 'dataHora'; usar const evita reatribuição acidental.
    const dataHora = converterDataHora(dados.data_hora);
    // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
    const [resultado] = await connection.execute<ResultSetHeader>(
      `INSERT INTO agendamentos (data_hora, placa_veiculo, modelo_veiculo, id_cliente, status)
       VALUES (?, ?, ?, ?, 'Pendente')`,
      [dataHora, dados.placa_veiculo, dados.modelo_veiculo, id_cliente]
    );

    // Cria a constante local 'idAgendamento'; usar const evita reatribuição acidental.
    const idAgendamento = resultado.insertId;

    // Condição: se 'dados.servicos.length > 0' for verdadeira, o bloco abaixo é executado.
    if (dados.servicos.length > 0) {
      // Cria a constante local 'placeholders'; usar const evita reatribuição acidental.
      const placeholders = dados.servicos.map(() => "(?, ?)").join(", ");
      const params: number[] = [];
      // Inicia laço for com 'const idServico of dados.servicos', repetindo o bloco para cada iteração.
      for (const idServico of dados.servicos) {
        // Executa: params.push(idAgendamento, idServico);.
        params.push(idAgendamento, idServico);
      }
      // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
      await connection.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES ${placeholders}`,
        params
      );
    }

    // Aguarda conclusão da operação assíncrona: connection.commit();.
    await connection.commit();
    // Retorna idAgendamento para quem chamou esta função.
    return idAgendamento;
  } catch (erro) {
    // Aguarda conclusão da operação assíncrona: connection.rollback();.
    await connection.rollback();
    // Lança exceção/valor: erro;.
    throw erro;
  } finally {
    // Executa: connection.release();.
    connection.release();
  }
}

export async function atualizarAgendamentoCliente(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: CriarAgendamentoInput
): Promise<number> {
  // Cria a constante local 'connection'; usar const evita reatribuição acidental.
  const connection = await pool.getConnection();
  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: connection.beginTransaction();.
    await connection.beginTransaction();
    // Aguarda conclusão da operação assíncrona: garantirServicosExistem(connection, dados.servicos);.
    await garantirServicosExistem(connection, dados.servicos);

    // Cria a constante local 'dataHora'; usar const evita reatribuição acidental.
    const dataHora = converterDataHora(dados.data_hora);
    // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
    const [resultado] = await connection.execute<ResultSetHeader>(
      `UPDATE agendamentos
          SET data_hora = ?, placa_veiculo = ?, modelo_veiculo = ?
        WHERE id_agendamento = ? AND id_cliente = ?`,
      [dataHora, dados.placa_veiculo, dados.modelo_veiculo, id_agendamento, id_cliente]
    );

    // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
    await connection.execute(
      "DELETE FROM agendamento_servico WHERE id_agendamento = ?",
      [id_agendamento]
    );

    // Condição: se 'dados.servicos.length > 0' for verdadeira, o bloco abaixo é executado.
    if (dados.servicos.length > 0) {
      // Cria a constante local 'placeholders'; usar const evita reatribuição acidental.
      const placeholders = dados.servicos.map(() => "(?, ?)").join(", ");
      const params: number[] = [];
      // Inicia laço for com 'const idServico of dados.servicos', repetindo o bloco para cada iteração.
      for (const idServico of dados.servicos) {
        // Executa: params.push(id_agendamento, idServico);.
        params.push(id_agendamento, idServico);
      }
      // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
      await connection.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES ${placeholders}`,
        params
      );
    }

    // Aguarda conclusão da operação assíncrona: connection.commit();.
    await connection.commit();
    // Retorna resultado.affectedRows para quem chamou esta função.
    return resultado.affectedRows;
  } catch (erro) {
    // Aguarda conclusão da operação assíncrona: connection.rollback();.
    await connection.rollback();
    // Lança exceção/valor: erro;.
    throw erro;
  } finally {
    // Executa: connection.release();.
    connection.release();
  }
}

export async function listarAgendamentosCliente(
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number,
  limite?: number,
  offset?: number
): Promise<{ agendamentos: Agendamento[]; total: number }> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM agendamentos WHERE id_cliente = ?",
    [id_cliente]
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_cliente = ? ORDER BY data_hora DESC`;
  const params: (number | string)[] = [id_cliente];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<AgendamentoRow[]>(query, params);
  // Cria a constante local 'agendamentos'; usar const evita reatribuição acidental.
  const agendamentos = await mapearAgendamentos(rows);

  // Retorna { agendamentos, total } para quem chamou esta função.
  return { agendamentos, total };
}

export async function listarTodosAgendamentos(
  limite?: number,
  offset?: number
): Promise<{ agendamentos: Agendamento[]; total: number }> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM agendamentos"
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      ORDER BY a.data_hora DESC`;
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<AgendamentoRow[]>(query, params);
  // Cria a constante local 'agendamentos'; usar const evita reatribuição acidental.
  const agendamentos = await mapearAgendamentos(rows);

  // Retorna { agendamentos, total } para quem chamou esta função.
  return { agendamentos, total };
}

export async function buscarAgendamentoCliente(
  // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
  id_agendamento: number,
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number
): Promise<Agendamento | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT id_agendamento, data_hora, placa_veiculo, modelo_veiculo, status, id_cliente
       FROM agendamentos WHERE id_agendamento = ? AND id_cliente = ? LIMIT 1`,
    [id_agendamento, id_cliente]
  );
  if (rows.length === 0) return null;
  // Cria a constante local 'lista'; usar const evita reatribuição acidental.
  const lista = await mapearAgendamentos(rows);
  // Retorna lista[0] ?? null para quem chamou esta função.
  return lista[0] ?? null;
}

// Exporta a função assíncrona 'buscarAgendamentoPorId'(id_agendamento: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarAgendamentoPorId(id_agendamento: number): Promise<Agendamento | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<AgendamentoRow[]>(
    `SELECT a.id_agendamento, a.data_hora, a.placa_veiculo, a.modelo_veiculo, a.status,
            a.id_cliente, c.nome AS nome_cliente
       FROM agendamentos a JOIN clientes c ON c.id_cliente = a.id_cliente
      WHERE a.id_agendamento = ? LIMIT 1`,
    [id_agendamento]
  );
  if (rows.length === 0) return null;
  // Cria a constante local 'lista'; usar const evita reatribuição acidental.
  const lista = await mapearAgendamentos(rows);
  // Retorna lista[0] ?? null para quem chamou esta função.
  return lista[0] ?? null;
}

// Declara a interface 'NovoAgendamentoCompleto' para definir o contrato/forma de dados em TypeScript.
export interface NovoAgendamentoCompleto {
  // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
  id_cliente: number;
  // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
  placa_veiculo: string;
  // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
  modelo_veiculo: string;
  observacoes?: string;
  // Define a propriedade/campo 'data_hora' no objeto/estrutura.
  data_hora: string; // "2026-11-10 09:00:00"
  // Define a propriedade/campo 'ids_servicos' no objeto/estrutura.
  ids_servicos: number[]; // serviço principal + acréscimos
}

// Declara a interface 'AgendamentoAdminRow' para definir o contrato/forma de dados em TypeScript.
export interface AgendamentoAdminRow extends RowDataPacket {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: number;
  // Define a propriedade/campo 'cliente' no objeto/estrutura.
  cliente: string;
  // Define a propriedade/campo 'servico' no objeto/estrutura.
  servico: string;
  // Define a propriedade/campo 'servicoId' no objeto/estrutura.
  servicoId: number;
  // Define a propriedade/campo 'extras' no objeto/estrutura.
  extras: number[];
  // Define a propriedade/campo 'placa' no objeto/estrutura.
  placa: string;
  // Define a propriedade/campo 'veiculo' no objeto/estrutura.
  veiculo: string;
  // Define a propriedade/campo 'observacoes' no objeto/estrutura.
  observacoes: string | null;
  // Define a propriedade/campo 'data' no objeto/estrutura.
  data: string;
  // Define a propriedade/campo 'horario' no objeto/estrutura.
  horario: string;
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: "Pendente" | "Confirmado" | "Cancelado";
}

interface AgendamentoAdminDbRow extends RowDataPacket {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'clienteId' no objeto/estrutura.
  clienteId: number;
  // Define a propriedade/campo 'cliente' no objeto/estrutura.
  cliente: string;
  // Define a propriedade/campo 'servico' no objeto/estrutura.
  servico: string;
  // Define a propriedade/campo 'servicoId' no objeto/estrutura.
  servicoId: number | null;
  // Define a propriedade/campo 'extrasIds' no objeto/estrutura.
  extrasIds: string | null;
  // Define a propriedade/campo 'placa' no objeto/estrutura.
  placa: string;
  // Define a propriedade/campo 'veiculo' no objeto/estrutura.
  veiculo: string;
  // Define a propriedade/campo 'observacoes' no objeto/estrutura.
  observacoes: string | null;
  // Define a propriedade/campo 'data' no objeto/estrutura.
  data: string;
  // Define a propriedade/campo 'horario' no objeto/estrutura.
  horario: string;
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: "Pendente" | "Confirmado" | "Cancelado";
}

export async function listarAgendamentosAdmin(
  limite?: number,
  offset?: number
): Promise<AgendamentoAdminRow[]> {
  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `SELECT a.id_agendamento AS id,
            c.id_cliente AS clienteId,
            c.nome AS cliente,
            // Executa: GROUP_CONCAT(s.nome_servico ORDER BY s.nome_servico SEPARATOR ', ') AS servico,.
            GROUP_CONCAT(s.nome_servico ORDER BY s.nome_servico SEPARATOR ', ') AS servico,
            // Executa: MAX(CASE WHEN s.id_categoria = 1 THEN s.id_servico END) AS servicoId,.
            MAX(CASE WHEN s.id_categoria = 1 THEN s.id_servico END) AS servicoId,
            // Executa: GROUP_CONCAT(.
            GROUP_CONCAT(
              CASE WHEN s.id_categoria = 2 THEN s.id_servico END
              ORDER BY s.id_servico SEPARATOR ','
            ) AS extrasIds,
            a.placa_veiculo AS placa,
            a.modelo_veiculo AS veiculo,
            a.observacoes,
            // Executa: DATE_FORMAT(a.data_hora, '%Y-%m-%d') AS data,.
            DATE_FORMAT(a.data_hora, '%Y-%m-%d') AS data,
            // Executa: TIME_FORMAT(a.data_hora, '%H:%i') AS horario,.
            TIME_FORMAT(a.data_hora, '%H:%i') AS horario,
            a.status
       FROM agendamentos a
       JOIN clientes c ON c.id_cliente = a.id_cliente
       LEFT JOIN agendamento_servico ags ON ags.id_agendamento = a.id_agendamento
       LEFT JOIN servicos s ON s.id_servico = ags.id_servico
      GROUP BY a.id_agendamento, c.id_cliente, c.nome, a.data_hora,
               a.placa_veiculo, a.modelo_veiculo, a.observacoes, a.status
      ORDER BY a.data_hora DESC`;
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [linhas] = await pool.execute<AgendamentoAdminDbRow[]>(query, params);
  return linhas.map((linha) => ({
    ...linha,
    // Define a propriedade/campo 'servicoId' no objeto/estrutura.
    servicoId: linha.servicoId ?? 0,
    // Define a propriedade/campo 'extras' no objeto/estrutura.
    extras: linha.extrasIds
      ? linha.extrasIds.split(",").map(Number).filter(Number.isInteger)
      : [],
  }));
}

// Exporta a função assíncrona 'contarAgendamentosAdmin'(); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function contarAgendamentosAdmin(): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM agendamentos"
  );
  // Retorna Number(totalRow?.total || 0) para quem chamou esta função.
  return Number(totalRow?.total || 0);
}

export async function atualizarAgendamentoCompleto(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: NovoAgendamentoCompleto,
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: "Pendente" | "Confirmado" | "Cancelado"
): Promise<"atualizado" | "nao-encontrado" | "horario-ocupado"> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    const [agendamentos] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_agendamento FROM agendamentos WHERE id_agendamento = ? FOR UPDATE",
      [id]
    );
    // Condição: se '!agendamentos.length' for verdadeira, o bloco abaixo é executado.
    if (!agendamentos.length) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "nao-encontrado" para quem chamou esta função.
      return "nao-encontrado";
    }

    const [ocupados] = await conexao.execute<RowDataPacket[]>(
      `SELECT id_agendamento FROM agendamentos
        WHERE data_hora = ? AND status <> 'Cancelado' AND id_agendamento <> ?
        FOR UPDATE`,
      [dados.data_hora, id]
    );
    // Condição: se 'ocupados.length && status !== "Cancelado"' for verdadeira, o bloco abaixo é executado.
    if (ocupados.length && status !== "Cancelado") {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna "horario-ocupado" para quem chamou esta função.
      return "horario-ocupado";
    }

    // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
    await conexao.execute<ResultSetHeader>(
      `UPDATE agendamentos
          SET data_hora = ?, placa_veiculo = ?, modelo_veiculo = ?,
              // Atribui valor: observacoes = ?, id_cliente = ?, status = ?.
              observacoes = ?, id_cliente = ?, status = ?
        WHERE id_agendamento = ?`,
      [
        dados.data_hora,
        dados.placa_veiculo,
        dados.modelo_veiculo,
        dados.observacoes || null,
        dados.id_cliente,
        status,
        id,
      ]
    );

    // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
    await conexao.execute<ResultSetHeader>(
      "DELETE FROM agendamento_servico WHERE id_agendamento = ?",
      [id]
    );
    // Inicia laço for com 'const idServico of dados.ids_servicos', repetindo o bloco para cada iteração.
    for (const idServico of dados.ids_servicos) {
      // Aguarda conclusão da operação assíncrona: conexao.execute<ResultSetHeader>(.
      await conexao.execute<ResultSetHeader>(
        "INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)",
        [id, idServico]
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

export async function atualizarStatusAgendamento(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  // Define a propriedade/campo 'status' no objeto/estrutura.
  status: StatusAgendamento
): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    "UPDATE agendamentos SET status = ? WHERE id_agendamento = ?",
    [status, id]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

export async function buscarStatusAgendamento(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number
): Promise<"Pendente" | "Confirmado" | "Cancelado" | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [linhas] = await pool.execute<RowDataPacket[]>(
    "SELECT status FROM agendamentos WHERE id_agendamento = ?",
    [id]
  );
  // Retorna (linhas[0]?.status as "Pendente" | "Confirmado" | "Cancelado") ?? null para quem chamou esta função.
  return (linhas[0]?.status as "Pendente" | "Confirmado" | "Cancelado") ?? null;
}
export async function listarHorariosOcupados(
  // Define a propriedade/campo 'data' no objeto/estrutura.
  data: string,
  ignorarAgendamentoId?: number
): Promise<string[]> {
  // Cria a constante local 'ignorarAtual'; usar const evita reatribuição acidental.
  const ignorarAtual = ignorarAgendamentoId === undefined ? "" : " AND id_agendamento <> ?";
  // Cria a constante local 'parametros'; usar const evita reatribuição acidental.
  const parametros = ignorarAgendamentoId === undefined
    ? [data]
    : [data, ignorarAgendamentoId];
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT TIME_FORMAT(data_hora, '%H:%i') AS horario
       FROM agendamentos
      WHERE DATE(data_hora) = ? AND status <> 'Cancelado'${ignorarAtual}`,
    parametros
  );

  // Retorna linhas.map((linha) => linha.horario as string) para quem chamou esta função.
  return linhas.map((linha) => linha.horario as string);
}
export async function criarAgendamentoCompleto(
  // Define a propriedade/campo 'dados' no objeto/estrutura.
  dados: NovoAgendamentoCompleto
): Promise<number | null> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    const [ocupados] = await conexao.execute<RowDataPacket[]>(
      `SELECT id_agendamento FROM agendamentos
        WHERE data_hora = ? AND status <> 'Cancelado' FOR UPDATE`,
      [dados.data_hora]
    );

    // Condição: se 'ocupados.length > 0' for verdadeira, o bloco abaixo é executado.
    if (ocupados.length > 0) {
      // Aguarda conclusão da operação assíncrona: conexao.rollback();.
      await conexao.rollback();
      // Retorna null para quem chamou esta função.
      return null;
    }

    const [agendamento] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO agendamentos (data_hora, placa_veiculo, modelo_veiculo, observacoes, id_cliente)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dados.data_hora,
        dados.placa_veiculo,
        dados.modelo_veiculo,
        dados.observacoes || null,
        dados.id_cliente,
      ]
    );

    // Inicia laço for com 'const idServico of dados.ids_servicos', repetindo o bloco para cada iteração.
    for (const idServico of dados.ids_servicos) {
      // Aguarda conclusão da operação assíncrona: conexao.execute(.
      await conexao.execute(
        `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES (?, ?)`,
        [agendamento.insertId, idServico]
      );
    }

    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
    // Retorna agendamento.insertId para quem chamou esta função.
    return agendamento.insertId;
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
// Camada SQL de agendamentos: cria, lista, filtra e atualiza agendamentos.
