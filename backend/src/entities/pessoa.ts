import { RequisicaoInvalidaError } from "../errors/AppError";

export abstract class Pessoa {
  // Executa: constructor(.
  constructor(
    protected _id: number,
    protected _nome: string,
    protected _email: string,
    protected _telefone: string,
    protected _ativo: boolean = true
  ) {
    // Executa: this.validarCamposBase(_nome, _email);.
    this.validarCamposBase(_nome, _email);
    // Atribui valor: this._nome = _nome.trim();.
    this._nome = _nome.trim();
    // Atribui valor: this._email = _email.trim().toLowerCase();.
    this._email = _email.trim().toLowerCase();
    // Atribui valor: this._telefone = _telefone ? _telefone.trim() : "";.
    this._telefone = _telefone ? _telefone.trim() : "";
  }

  private validarCamposBase(nome: string, email: string): void {
    // Condição: se '!nome || nome.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!nome || nome.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Nome é obrigatório."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Nome é obrigatório.");
    }
    // Condição: se '!email || email.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!email || email.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("E-mail é obrigatório."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("E-mail é obrigatório.");
    }
  }

  get id(): number { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get telefone(): string { return this._telefone; }
  get ativo(): boolean { return this._ativo; }

  public desativar(): void { this._ativo = false; }
  public ativar(): void { this._ativo = true; }

  public abstract obterPapel(): string;
  public abstract toJSON(): Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/base de pessoa com campos comuns usados por entidades do domínio.
