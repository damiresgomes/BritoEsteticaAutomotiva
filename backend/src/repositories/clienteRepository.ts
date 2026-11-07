import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Cliente } from "../entities/cliente";

export interface NovoCliente {
  nome: string;
  email: string;
  telefone: string;
}

interface ClienteRow extends RowDataPacket, Cliente { }

const COLUNAS = "id_cliente, nome, email, telefone, data_cadastro"

export class ClienteRepository {
    async buscarPorId(id_cliente: number): Promise<Cliente | null> {
        const [clientes] = await pool.execute<ClienteRow[]>(
            `SELECT ${COLUNAS} FROM clientes WHERE id_cliente = ?`,
            [id_cliente]
        );

        return clientes[0] ?? null; 
    }

    async buscarClientes(): Promise<Cliente[]> {
        const [clientes] = await pool.execute<ClienteRow[]>(
            `SELECT ${COLUNAS} FROM clientes`
        );

        return clientes;
    }

    async buscarClientesPorNome(nome: string): Promise<Cliente[] | null> {
        const [clientes] = await pool.execute<ClienteRow[]>(
            `SELECT ${COLUNAS} FROM clientes WHERE nome LIKE CONCAT('%', ? , '%')`,
            [nome]
        );
        return clientes ?? null;
    }

    async criarCliente(cliente: NovoCliente): Promise<number> {
        const [criado] = await pool.execute<ResultSetHeader>(
            `INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)`,
            [
                cliente.nome,
                cliente.email,
                cliente.telefone
            ]
        );

        return criado.insertId;
    }
}