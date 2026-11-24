import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/database";
import { PapelUsuario, Usuario } from "../entities/usuario";

// Declara a interface 'NovoUsuario' para definir o contrato/forma de dados em TypeScript.
export interface NovoUsuario {
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: string;
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: number;
  // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
  datanascimento: string;
}

// Declara o alias de tipo 'DadosAtualizacaoUsuario' para nomear uma estrutura de tipo reutilizável.
export type DadosAtualizacaoUsuario = Omit<NovoUsuario, "email">;

interface UsuarioRow extends RowDataPacket {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: string;
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: number;
  // Define a propriedade/campo 'dataDeNascimento' no objeto/estrutura.
  dataDeNascimento: string;
  // Define a propriedade/campo 'ativo' no objeto/estrutura.
  ativo: string;
  // Define a propriedade/campo 'papel' no objeto/estrutura.
  papel: PapelUsuario;
}

// Cria a constante local 'COLUNAS'; usar const evita reatribuição acidental.
const COLUNAS =
  "id, nome, email, senha AS senhaHash, cpf, salario, datanascimento AS dataDeNascimento, ativo, papel";

// Declara a função local 'mapearUsuario'(row: UsuarioRow) para encapsular lógica reutilizável neste arquivo.
function mapearUsuario(row: UsuarioRow): Usuario {
  return new Usuario(
    row.id,
    row.nome,
    row.email,
    "",
    row.cpf,
    // Executa: Number(row.salario),.
    Number(row.salario),
    row.dataDeNascimento,
    row.senhaHash,
    // Atribui valor: row.ativo === "Sim",.
    row.ativo === "Sim",
    row.papel ?? "usuario"
  );
}

// Exporta a função assíncrona 'buscarPorEmail'(email: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE email = ? LIMIT 1`,
    [email]
  );
  if (usuarios.length === 0) return null;
  // Retorna mapearUsuario(usuarios[0]) para quem chamou esta função.
  return mapearUsuario(usuarios[0]);
}

// Exporta a função assíncrona 'buscarPorCpf'(cpf: string); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarPorCpf(cpf: string): Promise<Usuario | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario
      WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?
      LIMIT 1`,
    [cpf]
  );
  if (usuarios.length === 0) return null;
  // Retorna mapearUsuario(usuarios[0]) para quem chamou esta função.
  return mapearUsuario(usuarios[0]);
}

// Exporta a função assíncrona 'buscarPorId'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function buscarPorId(id: number): Promise<Usuario | null> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [usuarios] = await pool.execute<UsuarioRow[]>(
    `SELECT ${COLUNAS} FROM usuario WHERE id = ? LIMIT 1`,
    [id]
  );
  if (usuarios.length === 0) return null;
  // Retorna mapearUsuario(usuarios[0]) para quem chamou esta função.
  return mapearUsuario(usuarios[0]);
}

// Exporta a função assíncrona 'criarUsuario'(usuario: NovoUsuario); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function criarUsuario(usuario: NovoUsuario): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuario (nome, email, senha, cpf, salario, datanascimento, ativo, papel)
     VALUES (?, ?, ?, ?, ?, ?, 'Sim', 'usuario')`,
    [
      usuario.nome,
      usuario.email,
      usuario.senhaHash,
      usuario.cpf,
      usuario.salario,
      usuario.datanascimento,
    ]
  );
  // Retorna resultado.insertId para quem chamou esta função.
  return resultado.insertId;
}

export async function buscarTodos(
  limite?: number,
  offset?: number
): Promise<{ usuarios: Usuario[]; total: number }> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [[totalRow]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM usuario WHERE ativo = 'Sim'"
  );
  // Cria a constante local 'total'; usar const evita reatribuição acidental.
  const total = Number(totalRow?.total || 0);

  // Cria a variável 'query' com let, permitindo reatribuição quando necessário.
  let query = `SELECT ${COLUNAS} FROM usuario WHERE ativo = 'Sim' ORDER BY nome`;
  const params: number[] = [];

  // Condição: se 'limite !== undefined && offset !== undefined' for verdadeira, o bloco abaixo é executado.
  if (limite !== undefined && offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    // Executa: params.push(limite, offset);.
    params.push(limite, offset);
  }

  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [rows] = await pool.execute<UsuarioRow[]>(query, params);
  // Cria a constante local 'usuarios'; usar const evita reatribuição acidental.
  const usuarios = rows.map(mapearUsuario);

  // Retorna { usuarios, total } para quem chamou esta função.
  return { usuarios, total };
}

// Exporta a função assíncrona 'atualizarUsuario'(id: number, dados: DadosAtualizacaoUsuario); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function atualizarUsuario(id: number, dados: DadosAtualizacaoUsuario): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
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
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

// Exporta a função assíncrona 'desativarUsuario'(id: number); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function desativarUsuario(id: number): Promise<number> {
  // Executa comando SQL parametrizado no MySQL via pool.execute/connection.execute; placeholders evitam SQL injection.
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE usuario SET ativo = 'Não' WHERE id = ?`,
    [id]
  );
  // Retorna resultado.affectedRows para quem chamou esta função.
  return resultado.affectedRows;
}

export async function atualizarPerfilUsuario(
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number,
  dados: {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: string;
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: string;
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: number;
    // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
    datanascimento: string;
    senhaHash?: string;
  }
): Promise<void> {
  // Cria a constante local 'conexao'; usar const evita reatribuição acidental.
  const conexao = await pool.getConnection();

  // Inicia bloco try: código que pode lançar exceção fica aqui para ser tratado no catch.
  try {
    // Aguarda conclusão da operação assíncrona: conexao.beginTransaction();.
    await conexao.beginTransaction();
    // Aguarda conclusão da operação assíncrona: conexao.execute(.
    await conexao.execute(
      `UPDATE usuario
          SET nome = ?, cpf = ?, salario = ?, datanascimento = ?
        WHERE id = ?`,
      [dados.nome, dados.cpf, dados.salario, dados.datanascimento, id]
    );
    // Condição: se 'dados.senhaHash' for verdadeira, o bloco abaixo é executado.
    if (dados.senhaHash) {
      // Aguarda conclusão da operação assíncrona: conexao.execute(.
      await conexao.execute(
        `UPDATE usuario SET senha = ? WHERE id = ?`,
        [dados.senhaHash, id]
      );
    }
    // Aguarda conclusão da operação assíncrona: conexao.commit();.
    await conexao.commit();
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
// Camada SQL de usuários: consultas e comandos no MySQL usando pool.execute e prepared statements.
