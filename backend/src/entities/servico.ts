import { RequisicaoInvalidaError } from "../errors/AppError";

// Declara e exporta a classe 'Servico', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Servico {
  // Executa: constructor(.
  constructor(
    private _id: number,
    private _nome: string,
    private _descricao: string,
    private _preco: number,
    private _duracaoHoras: number,
    private _idCategoria: number
  ) {
    // Executa: this.validarNome(_nome);.
    this.validarNome(_nome);
    // Executa: this.validarPreco(_preco);.
    this.validarPreco(_preco);
    // Executa: this.validarDuracao(_duracaoHoras);.
    this.validarDuracao(_duracaoHoras);
    // Executa: this.validarCategoria(_idCategoria);.
    this.validarCategoria(_idCategoria);
    // Atribui valor: this._nome = _nome.trim();.
    this._nome = _nome.trim();
    // Atribui valor: this._descricao = _descricao ? _descricao.trim() : "";.
    this._descricao = _descricao ? _descricao.trim() : "";
  }

  private validarNome(nome: string): void {
    // Condição: se '!nome || nome.trim().length === 0' for verdadeira, o bloco abaixo é executado.
    if (!nome || nome.trim().length === 0) {
      // Lança 'RequisicaoInvalidaError' com ("Nome do serviço é obrigatório."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("Nome do serviço é obrigatório.");
    }
  }

  private validarPreco(preco: number): void {
    // Condição: se 'preco <= 0' for verdadeira, o bloco abaixo é executado.
    if (preco <= 0) {
      // Lança 'RequisicaoInvalidaError' com (`O preço deve ser maior que zero. Informado: ${preco}`), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError(`O preço deve ser maior que zero. Informado: ${preco}`);
    }
  }

  private validarDuracao(duracaoHoras: number): void {
    // Condição: se 'duracaoHoras <= 0' for verdadeira, o bloco abaixo é executado.
    if (duracaoHoras <= 0) {
      // Lança 'RequisicaoInvalidaError' com (`A duração deve ser maior que zero. Informada: ${duracaoHoras}`), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError(`A duração deve ser maior que zero. Informada: ${duracaoHoras}`);
    }
  }

  private validarCategoria(idCategoria: number): void {
    // Condição: se '!Number.isInteger(idCategoria) || idCategoria <= 0' for verdadeira, o bloco abaixo é executado.
    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
      // Lança 'RequisicaoInvalidaError' com ("ID de categoria inválido para o serviço."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new RequisicaoInvalidaError("ID de categoria inválido para o serviço.");
    }
  }

  get id(): number { return this._id; }
  get nome(): string { return this._nome; }
  get descricao(): string { return this._descricao; }
  get preco(): number { return this._preco; }
  get duracaoHoras(): number { return this._duracaoHoras; }
  get idCategoria(): number { return this._idCategoria; }

  public atualizarDados(dados: {
    // Define a propriedade/campo 'nome' no objeto/estrutura.
    nome: string;
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: string;
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: number;
    // Define a propriedade/campo 'duracaoHoras' no objeto/estrutura.
    duracaoHoras: number;
    // Define a propriedade/campo 'idCategoria' no objeto/estrutura.
    idCategoria: number;
  }): void {
    // Executa: this.validarNome(dados.nome);.
    this.validarNome(dados.nome);
    // Executa: this.validarPreco(dados.preco);.
    this.validarPreco(dados.preco);
    // Executa: this.validarDuracao(dados.duracaoHoras);.
    this.validarDuracao(dados.duracaoHoras);
    // Executa: this.validarCategoria(dados.idCategoria);.
    this.validarCategoria(dados.idCategoria);

    // Atribui valor: this._nome = dados.nome.trim();.
    this._nome = dados.nome.trim();
    // Atribui valor: this._descricao = dados.descricao.trim();.
    this._descricao = dados.descricao.trim();
    // Atribui valor: this._preco = dados.preco;.
    this._preco = dados.preco;
    // Atribui valor: this._duracaoHoras = dados.duracaoHoras;.
    this._duracaoHoras = dados.duracaoHoras;
    // Atribui valor: this._idCategoria = dados.idCategoria;.
    this._idCategoria = dados.idCategoria;
  }

  public atualizarPreco(novoPreco: number): void {
    // Executa: this.validarPreco(novoPreco);.
    this.validarPreco(novoPreco);
    // Atribui valor: this._preco = novoPreco;.
    this._preco = novoPreco;
  }

  public toJSON() {
    return {
      // Define a propriedade/campo 'id_servico' no objeto/estrutura.
      id_servico: this._id,
      // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
      nome_servico: this._nome,
      // Define a propriedade/campo 'descricao' no objeto/estrutura.
      descricao: this._descricao,
      // Define a propriedade/campo 'preco' no objeto/estrutura.
      preco: this._preco,
      // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
      duracao_horas: this._duracaoHoras,
      // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
      id_categoria: this._idCategoria,
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de serviço.
