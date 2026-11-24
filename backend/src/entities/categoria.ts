import { RequisicaoInvalidaError } from "../errors/AppError";

// Declara e exporta a classe 'Categoria', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Categoria {
  // Executa: constructor(.
  constructor(
    private _id: number,
    private _nome: string
  ) {
    // Executa: this.validarNome(_nome);.
    this.validarNome(_nome);
    // Atribui valor: this._nome = _nome.trim();.
    this._nome = _nome.trim();
  }

  private validarNome(nome: string): void {
    // Condição: se '!nome || nome.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!nome || nome.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("O nome da categoria não pode ser vazio."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("O nome da categoria não pode ser vazio.");
    }
    // Condição: se 'nome.trim().length < 3' for verdadeira, o bloco abaixo é executado.
    if (nome.trim().length < 3) {
      // Lança 'RequisicaoInvalidaError' com ("O nome da categoria deve ter no mínimo 3 caracteres."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("O nome da categoria deve ter no mínimo 3 caracteres.");
    }
  }

  get id(): number { return this._id; }
  get nome(): string { return this._nome; }

  public atualizarNome(novoNome: string): void {
    // Executa: this.validarNome(novoNome);.
    this.validarNome(novoNome);
    // Atribui valor: this._nome = novoNome.trim();.
    this._nome = novoNome.trim();
  }

  public toJSON() {
    return {
      // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
      id_categoria: this._id,
      // Define a propriedade/campo 'nome_categoria' no objeto/estrutura.
      nome_categoria: this._nome,
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de categoria.
