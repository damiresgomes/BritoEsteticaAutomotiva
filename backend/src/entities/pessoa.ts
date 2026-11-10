import { RequisicaoInvalidaError } from "../errors/AppError";

export abstract class Pessoa {
  protected _id: number;
  protected _nome: string;
  protected _email: string;
  protected _telefone: string;
  protected _ativo: boolean;

  constructor(
    id: number,
    nome: string,
    email: string,
    telefone: string,
    ativo: boolean = true
  ) {
    this.validarCamposBase(nome, email);
    this._id = id;
    this._nome = nome.trim();
    this._email = email.trim().toLowerCase();
    this._telefone = telefone ? telefone.trim() : "";
    this._ativo = ativo;
  }

  private validarCamposBase(nome: string, email: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new RequisicaoInvalidaError("Nome é obrigatório.");
    }
    if (!email || email.trim().length === 0) {
      throw new RequisicaoInvalidaError("E-mail é obrigatório.");
    }
  }

  get id(): number {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get telefone(): string {
    return this._telefone;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  public desativar(): void {
    this._ativo = false;
  }

  public ativar(): void {
    this._ativo = true;
  }

  public abstract obterPapel(): string;
  public abstract toJSON(): Record<string, unknown>;
}
