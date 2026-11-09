import { Pessoa } from "./pessoa";
import { RequisicaoInvalidaError } from "../errors/AppError";

export enum StatusAtivo {
  SIM = "Sim",
  NAO = "Não",
}

export type PapelUsuario = "admin" | "usuario";

export class Usuario extends Pessoa {
  private _cpf: string;
  private _salario: number;
  private _dataDeNascimento: string;
  private _senhaHash: string;
  private _papel: PapelUsuario;

  constructor(
    id: number,
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    salario: number,
    dataDeNascimento: string,
    senhaHash: string,
    ativo: boolean = true,
    papel: PapelUsuario = "usuario"
  ) {
    super(id, nome, email, telefone, ativo);
    this.validarSalario(salario);
    this._cpf = cpf;
    this._salario = salario;
    this._dataDeNascimento = dataDeNascimento;
    this._senhaHash = senhaHash;
    this._papel = papel;
  }

  private validarSalario(salario: number): void {
    if (salario <= 0) {
      throw new RequisicaoInvalidaError("Salário deve ser maior que zero!");
    }
  }

  get cpf(): string {
    return this._cpf;
  }

  get salario(): number {
    return this._salario;
  }

  get dataDeNascimento(): string {
    return this._dataDeNascimento;
  }

  get senhaHash(): string {
    return this._senhaHash;
  }

  get papel(): PapelUsuario {
    return this._papel;
  }

  public set salario(novoSalario: number) {
    this.validarSalario(novoSalario);
    this._salario = novoSalario;
  }

  public atualizarDados(dados: {
    nome: string;
    cpf: string;
    salario: number;
    dataDeNascimento: string;
    senhaHash?: string;
  }): void {
    this.validarSalario(dados.salario);
    this._nome = dados.nome.trim();
    this._cpf = dados.cpf;
    this._salario = dados.salario;
    this._dataDeNascimento = dados.dataDeNascimento;
    if (dados.senhaHash) {
      this._senhaHash = dados.senhaHash;
    }
  }

  public override obterPapel(): PapelUsuario {
    return this._papel;
  }

  public override toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      email: this._email,
      cpf: this._cpf,
      salario: this._salario,
      dataNascimento: this._dataDeNascimento,
      ativo: this._ativo ? "Sim" : "Não",
      papel: this._papel,
    };
  }
}
