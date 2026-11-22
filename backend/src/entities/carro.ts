import { RequisicaoInvalidaError } from "../errors/AppError";

export class Carro {
  constructor(
    private _placa: string,
    private _modelo: string
  ) {
    this.validarCampos(_placa, _modelo);
    this._placa = _placa.trim().toUpperCase();
    this._modelo = _modelo.trim();
  }

  private validarCampos(placa: string, modelo: string): void {
    if (!placa || placa.trim().length === 0) {
      throw new RequisicaoInvalidaError("Placa do veículo é obrigatória.");
    }
    if (!modelo || modelo.trim().length === 0) {
      throw new RequisicaoInvalidaError("Modelo do veículo é obrigatório.");
    }
  }

  get placa(): string { return this._placa; }
  get modelo(): string { return this._modelo; }

  public atualizarPlaca(novaPlaca: string): void {
    if (!novaPlaca || novaPlaca.trim().length === 0) {
      throw new RequisicaoInvalidaError("Placa não pode ser vazia.");
    }
    this._placa = novaPlaca.trim().toUpperCase();
  }

  public atualizarModelo(novoModelo: string): void {
    if (!novoModelo || novoModelo.trim().length === 0) {
      throw new RequisicaoInvalidaError("Modelo não pode ser vazio.");
    }
    this._modelo = novoModelo.trim();
  }

  public toJSON() {
    return {
      placa: this._placa,
      modelo: this._modelo,
    };
  }
}
