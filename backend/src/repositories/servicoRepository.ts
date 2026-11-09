import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface NovoServico {
  nome_servico: string;
  descricao: string;
  preco: number;
  duracao_horas: number;
  id_categoria: number;
}

export interface Servico extends NovoServico {
    id_servico: number;
}

interface ServicoRow extends RowDataPacket, Servico { }

const COLUNAS = "id_servico, nome_servico, descricao, preco, duracao_horas, id_categoria";

export async function buscarServico(id: number): Promise<Servico | null> {
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos WHERE id_servico = ?`,
        [id]
    );

    return servicos[0] ?? null;
}

export async function buscarServicoPorNomeExato(nome: string): Promise<Servico | null> {
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos WHERE nome_servico = ?`,
        [nome]
    );

    return servicos[0] ?? null;
}

export async function buscarServicoPorNome(nome: string): Promise<Servico[] | null> {
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos WHERE nome_servico LIKE CONCAT('%', ? , '%')`,
        [nome]
    );

    return servicos ?? null;
}

export async function criarServico(servico: NovoServico): Promise<number> {
    const [resultado] = await pool.execute<ResultSetHeader>(
        `INSERT INTO servicos (nome_servico, descricao, preco, duracao_horas, id_categoria) VALUES (?, ?, ?, ?, ?)`,
        [
            servico.nome_servico,
            servico.descricao,
            servico.preco,
            servico.duracao_horas,
            servico.id_categoria
        ]
    );

    return resultado.insertId;
}

export async function listarServicos(): Promise<Servico[]> {
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos`
    );

    return servicos;
}

export async function _atualizarServico(id_servico: number, servico: Servico): Promise<number> {
    const [resultado] = await pool.execute<ResultSetHeader>(
        `UPDATE servicos SET nome_servico = ?, descricao = ?, preco = ?, duracao_horas = ?, id_categoria = ? WHERE id_servico = ?`,
        [
            servico.nome_servico,
            servico.descricao,
            servico.preco,
            servico.duracao_horas,
            servico.id_categoria,
            servico.id_servico
        ]
    );

    return resultado.affectedRows;
}


export async function _excluirServico(id_servico: number): Promise<number> {
    const [resultado] = await pool.execute<ResultSetHeader>(
        `DELETE FROM servicos WHERE id_servico = ?`,
        [id_servico]
    );

    return resultado.affectedRows;
}

export async function listarServicosPorCategoria(id_categoria: number): Promise<Servico[]> {
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos WHERE id_categoria = ?`,
        [id_categoria]
    );

    return servicos;
}

export async function servicoPossuiAgendamentos(id_servico: number): Promise<boolean> {
    const [linhas] = await pool.execute<RowDataPacket[]>(
        "SELECT id_agendamento FROM agendamento_servico WHERE id_servico = ? LIMIT 1",
        [id_servico]
    );
    return linhas.length > 0;
}

export async function buscarServicosPorIds(ids: number[]): Promise<Servico[]> {
    if (ids.length === 0) return [];

    const marcadores = ids.map(() => "?").join(", ");
    const [servicos] = await pool.execute<ServicoRow[]>(
        `SELECT ${COLUNAS} FROM servicos WHERE id_servico IN (${marcadores})`,
        ids
    );

    return servicos;
}