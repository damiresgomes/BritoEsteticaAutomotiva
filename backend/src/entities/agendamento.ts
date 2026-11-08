import { Carro } from "./carro";
import { Cliente } from "./cliente";

export type StatusAgendamento = "Pendente" | "Confirmado" | "Em atendimento" | "Concluído" | "Cancelado";

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
        if(this.status === "Confirmado"){
            throw new Error("Agendamento já confirmado");
        }
        if(this.status === "Cancelado"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if(this.status === "Concluído"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if (this.status !== "Pendente") throw new Error(`Não é possível confirmar um agendamento com status: ${this.status}`);
        this.status = "Confirmado";
    }

    public cancelarAgendamento():void{
        if(this.status === "Em atendimento"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if(this.status === "Cancelado"){
            throw new Error("Agendamento já cancelado");
        }
        if(this.status === "Concluído"){
            throw new Error(`Infelizmente não é possível cancelar o agendamento que esta com status: ${this.status}`);
        }
        if (this.status !== "Pendente" && this.status !== "Confirmado") throw new Error(`Não é possível cancelar um agendamento com status: ${this.status}`);
        this.status = "Cancelado";
    }

    public atualizarAgendamento():void{
        if(this.status === "Concluído" || this.status === "Confirmado"){
            throw new Error(`Infelizmente não é possível atualizar o agendamento que esta com status: ${this.status}`);
        }
    }

    public atualizarDataHora(novaDataHora: Date): void {
    if (this.status === "Concluído" || this.status === "Cancelado" || this.status === "Em atendimento") {
        throw new Error(`Não é possível reagendar um serviço com status: ${this.status}`);
    }
    this.data_hora = novaDataHora;
}

}
