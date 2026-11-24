import { Pessoa } from "./pessoa";
import { RequisicaoInvalidaError } from "../errors/AppError";

// Declara o enum 'StatusAtivo', conjunto nomeado de valores permitidos.
export enum StatusAtivo {
  // Atribui valor: SIM = "Sim",.
  SIM = "Sim",
  // Atribui valor: NAO = "Não",.
  NAO = "Não",
}

// Declara o alias de tipo 'PapelUsuario' para nomear uma estrutura de tipo reutilizável.
export type PapelUsuario = "admin" | "usuario";

// Declara e exporta a classe 'Usuario', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Usuario extends Pessoa {
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
    private _cpf: string,
    private _salario: number,
    private _dataDeNascimento: string,
    private _senhaHash: string,
    // Define a propriedade/campo 'ativo' no objeto/estrutura.
    ativo: boolean = true,
    private _papel: PapelUsuario = "usuario"
  ) {
    // Executa: super(id, nome, email, telefone, ativo);.
    super(id, nome, email, telefone, ativo);
    // Executa: this.validarSalario(_salario);.
    this.validarSalario(_salario);
  }

  private validarSalario(salario: number): void {
    // Condição: se 'salario <= 0' for verdadeira, o bloco abaixo é executado.
    if (salario <= 0) {
      // Lança 'RequisicaoInvalidaError' com ("Salário deve ser maior que zero!"), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Salário deve ser maior que zero!");
    }
  }

  get cpf(): string { return this._cpf; }
  get salario(): number { return this._salario; }
  get dataDeNascimento(): string { return this._dataDeNascimento; }
  get senhaHash(): string { return this._senhaHash; }
  get papel(): PapelUsuario { return this._papel; }

  public set salario(novoSalario: number) {
    // Executa: this.validarSalario(novoSalario);.
    this.validarSalario(novoSalario);
    // Atribui valor: this._salario = novoSalario;.
    this._salario = novoSalario;
  }

  public atualizarDados(dados: {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: string;
    // Define a propriedade/campo 'cpf' no objeto/estrutura.
    cpf: string;
    // Define a propriedade/campo 'salario' no objeto/estrutura.
    salario: number;
    // Define a propriedade/campo 'dataDeNascimento' no objeto/estrutura.
    dataDeNascimento: string;
    senhaHash?: string;
  }): void {
    // Executa: this.validarSalario(dados.salario);.
    this.validarSalario(dados.salario);
    // Atribui valor: this._nome = dados.nome.trim();.
    this._nome = dados.nome.trim();
    // Atribui valor: this._cpf = dados.cpf;.
    this._cpf = dados.cpf;
    // Atribui valor: this._salario = dados.salario;.
    this._salario = dados.salario;
    // Atribui valor: this._dataDeNascimento = dados.dataDeNascimento;.
    this._dataDeNascimento = dados.dataDeNascimento;
    // Condição: se 'dados.senhaHash' for verdadeira, o bloco abaixo é executado.
    if (dados.senhaHash) {
      // Atribui valor: this._senhaHash = dados.senhaHash;.
      this._senhaHash = dados.senhaHash;
    }
  }

  public override obterPapel(): PapelUsuario {
    // Retorna this._papel para quem chamou esta função.
    return this._papel;
  }

  public override toJSON() {
    return {
      // Define a propriedade/campo 'id' no objeto/estrutura.
      id: this._id,
      // Define a propriedade/campo 'nome' no objeto/estrutura.
      nome: this._nome,
      // Define a propriedade/campo 'email' no objeto/estrutura.
      email: this._email,
      // Define a propriedade/campo 'cpf' no objeto/estrutura.
      cpf: this._cpf,
      // Define a propriedade/campo 'salario' no objeto/estrutura.
      salario: this._salario,
      // Define a propriedade/campo 'dataNascimento' no objeto/estrutura.
      dataNascimento: this._dataDeNascimento,
      // Define a propriedade/campo 'ativo' no objeto/estrutura.
      ativo: this._ativo ? "Sim" : "Não",
      // Define a propriedade/campo 'papel' no objeto/estrutura.
      papel: this._papel,
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de usuário do domínio.
