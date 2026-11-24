import { Carro } from "./carro";
import { ConflitoError, RequisicaoInvalidaError } from "../errors/AppError";

// Declara o alias de tipo 'StatusAgendamento' para nomear uma estrutura de tipo reutilizável.
export type StatusAgendamento =
  | "Pendente"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

// Declara a interface 'ServicoItemAgendado' para definir o contrato/forma de dados em TypeScript.
export interface ServicoItemAgendado {
  // Define a propriedade/campo 'id_servico' no objeto/estrutura.
  id_servico: number;
  // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
  nome_servico: string;
  // Define a propriedade/campo 'preco' no objeto/estrutura.
  preco: number;
  // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
  id_categoria: number;
}

const TRANSICOES_VALIDAS: Record<StatusAgendamento, StatusAgendamento[]> = {
  // Define a propriedade/campo 'Pendente' no objeto/estrutura.
  Pendente: ["Confirmado", "Cancelado"],
  // Define a propriedade/campo 'Confirmado' no objeto/estrutura.
  Confirmado: ["Em atendimento"],
  "Em atendimento": ["Concluído"],
  Concluído: [],
  // Define a propriedade/campo 'Cancelado' no objeto/estrutura.
  Cancelado: [],
};

// Declara e exporta a classe 'Agendamento', que modela um conceito do domínio ou encapsula comportamento relacionado.
export class Agendamento {
  // Executa: constructor(.
  constructor(
    private _id: number,
    private _dataHora: string,
    private _status: StatusAgendamento,
    private _idCliente: number,
    private _carro: Carro,
    private _servicos: ServicoItemAgendado[] = [],
    private _nomeCliente?: string
  ) {}

  get id(): number { return this._id; }
  get dataHora(): string { return this._dataHora; }
  get status(): StatusAgendamento { return this._status; }
  get idCliente(): number { return this._idCliente; }
  get carro(): Carro { return this._carro; }
  get nomeCliente(): string | undefined { return this._nomeCliente; }
  get servicos(): ServicoItemAgendado[] { return this._servicos; }

  public definirServicos(servicos: ServicoItemAgendado[]): void {
    // Atribui valor: this._servicos = servicos;.
    this._servicos = servicos;
  }

  public transitarPara(novoStatus: StatusAgendamento): void {
    // Condição: se 'novoStatus === "Cancelado" && this._status !== "Pendente"' for verdadeira, o bloco abaixo é executado.
    if (novoStatus === "Cancelado" && this._status !== "Pendente") {
      // Lança 'ConflitoError' com ("Só é possível cancelar agendamentos com status pendente."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new ConflitoError("Só é possível cancelar agendamentos com status pendente.");
    }

    // Cria a constante local 'permitidas'; usar const evita reatribuição acidental.
    const permitidas = TRANSICOES_VALIDAS[this._status];
    // Condição: se '!permitidas.includes(novoStatus)' for verdadeira, o bloco abaixo é executado.
    if (!permitidas.includes(novoStatus)) {
      // Lança exceção/valor: new ConflitoError(.
      throw new ConflitoError(
        `Não é possível alterar o status de "${this._status}" para "${novoStatus}".`
      );
    }
    // Atribui valor: this._status = novoStatus;.
    this._status = novoStatus;
  }

  public confirmar(): void { this.transitarPara("Confirmado"); }
  public iniciarAtendimento(): void { this.transitarPara("Em atendimento"); }
  public concluir(): void { this.transitarPara("Concluído"); }
  public cancelar(): void { this.transitarPara("Cancelado"); }

  public garantirModificavel(): void {
    // Condição: se 'this._status !== "Pendente"' for verdadeira, o bloco abaixo é executado.
    if (this._status !== "Pendente") {
      // Lança 'ConflitoError' com ("Só é possível editar agendamentos com status pendente."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new ConflitoError("Só é possível editar agendamentos com status pendente.");
    }
  }

  public atualizarDados(novaDataHora: string, novoCarro: Carro): void {
    // Executa: this.garantirModificavel();.
    this.garantirModificavel();
    // Atribui valor: this._dataHora = novaDataHora;.
    this._dataHora = novaDataHora;
    // Atribui valor: this._carro = novoCarro;.
    this._carro = novoCarro;
  }

  public toJSON() {
    return {
      // Define a propriedade/campo 'id_agendamento' no objeto/estrutura.
      id_agendamento: this._id,
      // Define a propriedade/campo 'data_hora' no objeto/estrutura.
      data_hora: this._dataHora,
      // Define a propriedade/campo 'placa_veiculo' no objeto/estrutura.
      placa_veiculo: this._carro.placa,
      // Define a propriedade/campo 'modelo_veiculo' no objeto/estrutura.
      modelo_veiculo: this._carro.modelo,
      // Define a propriedade/campo 'status' no objeto/estrutura.
      status: this._status,
      // Define a propriedade/campo 'id_cliente' no objeto/estrutura.
      id_cliente: this._idCliente,
      // Executa: ...(this._nomeCliente ? { nome_cliente: this._nomeCliente } : {}),.
      ...(this._nomeCliente ? { nome_cliente: this._nomeCliente } : {}),
      // Define a propriedade/campo 'servicos' no objeto/estrutura.
      servicos: this._servicos,
    };
  }
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Entidade/tipo de agendamento.
