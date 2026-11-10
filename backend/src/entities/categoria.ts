import { RequisicaoInvalidaError } from "../errors/AppError";

export class Categoria {
  private _id: number;
  private _nome: string;

  constructor(id: number, nome: string) {
    this.validarNome(nome);
    this._id = id;
    this._nome = nome.trim();
  }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new RequisicaoInvalidaError("O nome da categoria não pode ser vazio.");
    }
    if (nome.trim().length < 3) {
      throw new RequisicaoInvalidaError("O nome da categoria deve ter no mínimo 3 caracteres.");
    }
  }

  get id(): number {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  public atualizarNome(novoNome: string): void {
    this.validarNome(novoNome);
    this._nome = novoNome.trim();
  }

  public toJSON() {
    return {
      id_categoria: this._id,
      nome_categoria: this._nome,
    };
  }
}
