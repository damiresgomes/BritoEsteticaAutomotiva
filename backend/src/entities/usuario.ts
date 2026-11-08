import { Pessoa } from "./pessoa";

export enum StatusAtivo {
  SIM = "Sim",
  NAO = "Não",
}

export type PapelUsuario = "admin" | "usuario";

export class Usuario extends Pessoa {
    private _senhaHash: string;
    private _salario: number;
    private _ativo: StatusAtivo;
    private _papel: PapelUsuario;

    constructor(id: number, nome: string, email: string, cpf: string, dataDeNascimento: string, telefone: string, senhaHash: string, salario: number, ativo: StatusAtivo, papel: PapelUsuario = "usuario") {
        super(id, nome, email, cpf, dataDeNascimento, telefone);
        this._senhaHash = senhaHash;
        this._salario = salario;
        this._ativo = ativo;
        this._papel = papel;
    }

    get senhaHash(): string {
        return this._senhaHash;
    }

    get salario(): number {
        return this._salario;
    }

    get ativo(): StatusAtivo {
        return this._ativo;
    }

    get papel(): PapelUsuario {
        return this._papel;
    }

    set salario(novoSalario: number) {
        if (novoSalario <= 0) {
            throw new Error("Salário deve ser maior que zero!");
        }
        this._salario = novoSalario;
    }

    set ativo(novoAtivo: StatusAtivo) {
        this._ativo = novoAtivo;
    }

    public override obterPapel(): string {
        return "Usuário";
    }
}
