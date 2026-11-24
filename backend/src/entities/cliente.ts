import { Pessoa } from "./pessoa";

// Declara e exporta a classe 'Cliente', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Cliente extends Pessoa {
  // Executa: constructor(.
  constructor(
    // Define a propriedade/campo 'id' no objeto/estrutura.
    id: number,
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: string,
    // Define a propriedade/campo 'email' no objeto/estrutura.
    email: string,
    // Define a propriedade/campo 'telefone' no objeto/estrutura.
    telefone: string,
    // Define a propriedade/campo 'ativo' no objeto/estrutura.
    ativo: boolean = true,
    private _senhaHash?: string,
    private _cpf?: string
  ) {
    // Executa: super(id, nome, email, telefone, ativo);.
    super(id, nome, email, telefone, ativo);
  }

  get senhaHash(): string | undefined { return this._senhaHash; }
  get cpf(): string | undefined { return this._cpf; }

  public atualizarCadastro(nome: string, telefone: string, senhaHash?: string): void {
    // Atribui valor: this._nome = nome.trim();.
    this._nome = nome.trim();
    // Atribui valor: this._telefone = telefone.trim();.
    this._telefone = telefone.trim();
    // Condição: se 'senhaHash' for verdadeira, o bloco abaixo é executado.
    if (senhaHash) {
      // Atribui valor: this._senhaHash = senhaHash;.
      this._senhaHash = senhaHash;
    }
  }

  public override obterPapel(): string { return "cliente"; }

  public override toJSON() {
    return {
      // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
      id_cliente: this._id,
      // Define a propriedade/campo 'nome' no objeto/estrutura.
      nome: this._nome,
      // Define a propriedade/campo 'email' no objeto/estrutura.
      email: this._email,
      // Define a propriedade/campo 'telefone' no objeto/estrutura.
      telefone: this._telefone,
      // Define a propriedade/campo 'cpf' no objeto/estrutura.
      cpf: this._cpf ?? null,
      // Define a propriedade/campo 'ativo' no objeto/estrutura.
      ativo: this._ativo ? "Sim" : "Não",
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de cliente do domínio.
