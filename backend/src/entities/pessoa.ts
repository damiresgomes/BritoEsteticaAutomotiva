export abstract class Pessoa {
    protected _nome: string;
    protected _email: string;
    private _cpf: string;
    protected _dataDeNascimento: string;
    protected _telefone: string;
    protected _id: number;

    constructor(id: number, nome: string, email: string, cpf: string, dataDeNascimento: string, telefone: string) {
        this._id = id;
        this._nome = nome;
        this._email = email;
        this._cpf = cpf;
        this._dataDeNascimento = dataDeNascimento;
        this._telefone = telefone;
    }

    get cpf(): string {
        return this._cpf;
    }

    get nome(): string {
        return this._nome;
    }

    get email(): string {
        return this._email;
    }

    get dataDeNascimento(): string {
        return this._dataDeNascimento;
    }

    get telefone(): string {
        return this._telefone;
    }

    get id(): number {
        return this._id;
    }

    public abstract obterPapel(): string;

}
