import { RequisicaoInvalidaError } from "../errors/AppError";

// Declara e exporta a classe 'Carro', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Carro {
  // Executa: constructor(.
  constructor(
    private _placa: string,
    private _modelo: string
  ) {
    // Executa: this.validarCampos(_placa, _modelo);.
    this.validarCampos(_placa, _modelo);
    // Atribui valor: this._placa = _placa.trim().toUpperCase();.
    this._placa = _placa.trim().toUpperCase();
    // Atribui valor: this._modelo = _modelo.trim();.
    this._modelo = _modelo.trim();
  }

  private validarCampos(placa: string, modelo: string): void {
    // Condição: se '!placa || placa.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!placa || placa.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Placa do veículo é obrigatória."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Placa do veículo é obrigatória.");
    }
    // Condição: se '!modelo || modelo.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!modelo || modelo.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Modelo do veículo é obrigatório."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Modelo do veículo é obrigatório.");
    }
  }

  get placa(): string { return this._placa; }
  get modelo(): string { return this._modelo; }

  public atualizarPlaca(novaPlaca: string): void {
    // Condição: se '!novaPlaca || novaPlaca.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!novaPlaca || novaPlaca.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Placa não pode ser vazia."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Placa não pode ser vazia.");
    }
    // Atribui valor: this._placa = novaPlaca.trim().toUpperCase();.
    this._placa = novaPlaca.trim().toUpperCase();
  }

  public atualizarModelo(novoModelo: string): void {
    // Condição: se '!novoModelo || novoModelo.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!novoModelo || novoModelo.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Modelo não pode ser vazio."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Modelo não pode ser vazio.");
    }
    // Atribui valor: this._modelo = novoModelo.trim();.
    this._modelo = novoModelo.trim();
  }

  public toJSON() {
    return {
      // Define a propriedade/campo 'placa' no objeto/estrutura.
      placa: this._placa,
      // Define a propriedade/campo 'modelo' no objeto/estrutura.
      modelo: this._modelo,
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de carro/veículo relacionado ao cliente/agendamento.
