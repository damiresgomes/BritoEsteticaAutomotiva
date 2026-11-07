export class Carro {
    constructor(
        protected modelo: string,
        protected ano: number,
        protected placa: string,
        protected cambio: string,
        protected portas: string
    ) {}

    get modeloCarro(): string {
        return this.modelo;
    }

    get anoCarro(): number {
        return this.ano;
    }

    get placaCarro(): string {
        return this.placa;
    }

    get cambioCarro(): string {
        return this.cambio;
    }

    get portasCarro(): string {
        return this.portas;
    }

    public atualizarPlaca(novaPlaca: string): void {
        if (!novaPlaca || novaPlaca.trim().length === 0) {
            throw new Error("Placa não pode ser vazia");
        }
        this.placa = novaPlaca.trim().toUpperCase();
    }
}