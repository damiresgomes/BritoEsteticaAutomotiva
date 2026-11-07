import { Pessoa } from "./pessoa";

export class Cliente extends Pessoa {
    constructor(
        id: number,
        nome: string,
        telefone: string
    ) {
        super(id, nome, "", "", "", telefone);
    }

    get nome(): string {
        return this._nome;
    }

    get telefone(): string {
        return this._telefone;
    }

    set telefone(novoTelefone: string) {
        this._telefone = novoTelefone;
    }

    public override obterPapel(): string {
        return "Cliente";
    }
}
