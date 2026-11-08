export class Categoria {
    constructor(
        protected id_categoria: number,
        protected nome_categoria: string
    ) {}

    get id(): number {
        return this.id_categoria;
    }

    get nomeCategoria(): string {
        return this.nome_categoria;
    }

    public atualizarNome(novoNome: string): void {
        if (!novoNome || novoNome.trim().length === 0) {
            throw new Error("Nome da categoria não pode ser vazio");
        }
        this.nome_categoria = novoNome.trim();
    }
    
}
