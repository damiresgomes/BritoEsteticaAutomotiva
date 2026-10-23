import { pool } from "../config/database";
import { NovoServico, Servico } from "../types/servico";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface ServicoRow extends RowDataPacket, Servico { }

const COLUNAS = "id_servico, nome_servico, descricao, preco, duracao_horas, id_categoria";

export class ServicoRepository {
    async buscarServico(nome: string): Promise<Servico | null> {
        const [servicos] = await pool.execute<ServicoRow[]>(
            `SELECT ${COLUNAS} FROM servicos WHERE nome_servico = ?`,
            [nome]
        );

        return servicos[0] ?? null;
    }

    async buscarServicoPorNome(nome: string): Promise<Servico[] | null> {
        const [servicos] = await pool.execute<ServicoRow[]>(
            `SELECT ${COLUNAS} FROM servicos WHERE nome_servico LIKE CONCAT('%', ? , '%')`,
            [nome]
        );

        return servicos ?? null;
    }

    async criarServico(servico: NovoServico): Promise<number> {
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

    async listarServicos(): Promise<Servico[]> {
        const [servicos] = await pool.execute<ServicoRow[]>(
            `SELECT ${COLUNAS} FROM servicos`
        );

        return servicos;
    }

    async atualizarServico(servico: Servico): Promise<number> {
        const [resultado] = await pool.execute<ResultSetHeader>(
            `UPDATE servicos SET nome_servico = ?, descricao = ?, preco = ?, duracao_horas = ? WHERE id_servico = ?`,
            [
                servico.nome_servico,
                servico.descricao,
                servico.preco,
                servico.duracao_horas,
                servico.id_servico
            ]
        );

        return resultado.affectedRows;
    }

    async buscarTodosServicos(): Promise<Servico[]> {
        const [servicos] = await pool.execute<ServicoRow[]>(
            `SELECT ${COLUNAS} FROM servicos`
        );

        return servicos;
    }

    async excluirServico(id_servico: number): Promise<number> {
        const [resultado] = await pool.execute<ResultSetHeader>(
            `DELETE FROM servicos WHERE id_servico = ?`,
            [id_servico]
        );

        return resultado.affectedRows;
    }
}