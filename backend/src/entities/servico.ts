import { RequisicaoInvalidaError } from "../errors/AppError";

export class Servico {
  private _id: number;
  private _nome: string;
  private _descricao: string;
  private _preco: number;
  private _duracaoHoras: number;
  private _idCategoria: number;

  constructor(
    id: number,
    nome: string,
    descricao: string,
    preco: number,
    duracaoHoras: number,
    idCategoria: number
  ) {
    this.validarNome(nome);
    this.validarPreco(preco);
    this.validarDuracao(duracaoHoras);
    this.validarCategoria(idCategoria);

    this._id = id;
    this._nome = nome.trim();
    this._descricao = descricao ? descricao.trim() : "";
    this._preco = preco;
    this._duracaoHoras = duracaoHoras;
    this._idCategoria = idCategoria;
  }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new RequisicaoInvalidaError("Nome do serviço é obrigatório.");
    }
  }

  private validarPreco(preco: number): void {
    if (preco <= 0) {
      throw new RequisicaoInvalidaError(`O preço deve ser maior que zero. Informado: ${preco}`);
    }
  }

  private validarDuracao(duracaoHoras: number): void {
    if (duracaoHoras <= 0) {
      throw new RequisicaoInvalidaError(`A duração deve ser maior que zero. Informada: ${duracaoHoras}`);
    }
  }

  private validarCategoria(idCategoria: number): void {
    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
      throw new RequisicaoInvalidaError("ID de categoria inválido para o serviço.");
    }
  }

  get id(): number {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string {
    return this._descricao;
  }

  get preco(): number {
    return this._preco;
  }

  get duracaoHoras(): number {
    return this._duracaoHoras;
  }

  get idCategoria(): number {
    return this._idCategoria;
  }

  public atualizarDados(dados: {
    nome: string;
    descricao: string;
    preco: number;
    duracaoHoras: number;
    idCategoria: number;
  }): void {
    this.validarNome(dados.nome);
    this.validarPreco(dados.preco);
    this.validarDuracao(dados.duracaoHoras);
    this.validarCategoria(dados.idCategoria);

    this._nome = dados.nome.trim();
    this._descricao = dados.descricao.trim();
    this._preco = dados.preco;
    this._duracaoHoras = dados.duracaoHoras;
    this._idCategoria = dados.idCategoria;
  }

  public atualizarPreco(novoPreco: number): void {
    this.validarPreco(novoPreco);
    this._preco = novoPreco;
  }

  public toJSON() {
    return {
      id_servico: this._id,
      nome_servico: this._nome,
      descricao: this._descricao,
      preco: this._preco,
      duracao_horas: this._duracaoHoras,
      id_categoria: this._idCategoria,
    };
  }
}
