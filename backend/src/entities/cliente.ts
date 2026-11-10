import { Pessoa } from "./pessoa";

export class Cliente extends Pessoa {
  private _senhaHash?: string;

  constructor(
    id: number,
    nome: string,
    email: string,
    telefone: string,
    ativo: boolean = true,
    senhaHash?: string
  ) {
    super(id, nome, email, telefone, ativo);
    this._senhaHash = senhaHash;
  }

  get senhaHash(): string | undefined {
    return this._senhaHash;
  }

  public atualizarCadastro(nome: string, telefone: string, senhaHash?: string): void {
    this._nome = nome.trim();
    this._telefone = telefone.trim();
    if (senhaHash) {
      this._senhaHash = senhaHash;
    }
  }

  public override obterPapel(): string {
    return "cliente";
  }

  public override toJSON() {
    return {
      id_cliente: this._id,
      nome: this._nome,
      email: this._email,
      telefone: this._telefone,
      ativo: this._ativo ? "Sim" : "Não",
    };
  }
}
