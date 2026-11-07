import { Carro } from "./carro";
import { Cliente } from "./cliente";

export type StatusAgendamento = "PENDENTE" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO" | "EM ATENDIMENTO";

export class Agendamento {
    constructor(
        protected id_agendamento: number,
        protected data_hora: Date,
        protected status: StatusAgendamento,
        protected cliente: Cliente,
        protected carro: Carro
    ) {}

    get id(): number {
        return this.id_agendamento;
    }
    get dataHora(): Date {  
        return this.data_hora;
    }
    get statusAgendamento(): StatusAgendamento {
        return this.status;
    }
    get clienteAgendado(): Cliente {
        return this.cliente;
    }
    get carroAgendado(): Carro {
        return this.carro;
    }

   public confirmarAgendamento():void {
        if(this.status === "CONFIRMADO"){
            throw new Error("Agendamento já confirmado");
        }
        if(this.status === "CANCELADO"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if(this.status === "CONCLUIDO"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        this.status = "CONFIRMADO";
    }

    public cancelarAgendamento():void{
        if(this.status === "EM ATENDIMENTO"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if(this.status === "CANCELADO"){
            throw new Error("Agendamento já cancelado");
        }
        if(this.status === "CONCLUIDO"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        this.status = "CANCELADO";
    }

    public atualizarAgendamento():void{
        if(this.status === "CONCLUIDO" || this.status === "CONFIRMADO"){
            throw new Error(`Infelizmente não é possível atualizar o agendamento que esta com status: ${this.status}`);
        }
    }

    public atualizarDataHora(novaDataHora: Date): void {
    if (this.status === "CONCLUIDO" || this.status === "CANCELADO" || this.status === "EM ATENDIMENTO") {
        throw new Error(`Não é possível reagendar um serviço com status: ${this.status}`);
    }
    this.data_hora = novaDataHora;
}

}