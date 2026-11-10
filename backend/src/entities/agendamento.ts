import { Carro } from "./carro";
import { ConflitoError, RequisicaoInvalidaError } from "../errors/AppError";

export type StatusAgendamento =
  | "Pendente"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

export interface ServicoItemAgendado {
  id_servico: number;
  nome_servico: string;
  preco: number;
}

const TRANSICOES_VALIDAS: Record<StatusAgendamento, StatusAgendamento[]> = {
  Pendente: ["Confirmado", "Cancelado"],
  Confirmado: ["Em atendimento", "Cancelado"],
  "Em atendimento": ["Concluído"],
  Concluído: [],
  Cancelado: [],
};

export class Agendamento {
  private _id: number;
  private _dataHora: string;
  private _status: StatusAgendamento;
  private _idCliente: number;
  private _carro: Carro;
  private _nomeCliente?: string;
  private _servicos: ServicoItemAgendado[];

  constructor(
    id: number,
    dataHora: string,
    status: StatusAgendamento,
    idCliente: number,
    carro: Carro,
    servicos: ServicoItemAgendado[] = [],
    nomeCliente?: string
  ) {
    this._id = id;
    this._dataHora = dataHora;
    this._status = status;
    this._idCliente = idCliente;
    this._carro = carro;
    this._servicos = servicos;
    this._nomeCliente = nomeCliente;
  }

  get id(): number {
    return this._id;
  }

  get dataHora(): string {
    return this._dataHora;
  }

  get status(): StatusAgendamento {
    return this._status;
  }

  get idCliente(): number {
    return this._idCliente;
  }

  get carro(): Carro {
    return this._carro;
  }

  get nomeCliente(): string | undefined {
    return this._nomeCliente;
  }

  get servicos(): ServicoItemAgendado[] {
    return this._servicos;
  }

  public definirServicos(servicos: ServicoItemAgendado[]): void {
    this._servicos = servicos;
  }

  public transitarPara(novoStatus: StatusAgendamento): void {
    const permitidas = TRANSICOES_VALIDAS[this._status];
    if (!permitidas.includes(novoStatus)) {
      throw new ConflitoError(
        `Não é possível alterar o status de "${this._status}" para "${novoStatus}".`
      );
    }
    this._status = novoStatus;
  }

  public confirmar(): void {
    this.transitarPara("Confirmado");
  }

  public iniciarAtendimento(): void {
    this.transitarPara("Em atendimento");
  }

  public concluir(): void {
    this.transitarPara("Concluído");
  }

  public cancelar(): void {
    this.transitarPara("Cancelado");
  }

  public garantirModificavel(): void {
    if (this._status !== "Pendente" && this._status !== "Confirmado") {
      throw new ConflitoError(
        `Não é possível alterar um agendamento com status "${this._status}".`
      );
    }
  }

  public atualizarDados(novaDataHora: string, novoCarro: Carro): void {
    this.garantirModificavel();
    this._dataHora = novaDataHora;
    this._carro = novoCarro;
  }

  public toJSON() {
    return {
      id_agendamento: this._id,
      data_hora: this._dataHora,
      placa_veiculo: this._carro.placa,
      modelo_veiculo: this._carro.modelo,
      status: this._status,
      id_cliente: this._idCliente,
      ...(this._nomeCliente ? { nome_cliente: this._nomeCliente } : {}),
      servicos: this._servicos,
    };
  }
}
