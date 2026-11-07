export class Servico {
    constructor(
        protected id_servico: number,
        protected nome_servico: string,
        protected descricao: string,
        protected preco: number,
        protected duracao_horas: number,
        protected id_categoria: number
    ) {}

    get id(): number {
        return this.id_servico;
    }

    get nomeServico(): string {
        return this.nome_servico;
    }

    get descricaoServico(): string {
        return this.descricao;
    }

    get precoServico(): number {
        return this.preco;
    }

    get duracaoHoras(): number {
        return this.duracao_horas;
    }

    get idCategoria(): number {
        return this.id_categoria;
    }

    public atualizarPreco(novoPreco: number): void {
        if (novoPreco <= 0) {
            throw new Error(`Infelizmente o preço deve ser maior que zero, valor informado: ${novoPreco}`);
        }
        this.preco = novoPreco;
    }

    public atualizarDuracao(novaDuracao: number): void {
        if (novaDuracao <= 0) {
            throw new Error(`Infelizmente a duração deve ser maior que zero, valor informado: ${novaDuracao}`);
        }
        this.duracao_horas = novaDuracao;
    }

    public atualizarDescricao(novaDescricao: string): void {
        if (!novaDescricao || novaDescricao.trim().length === 0) {
            throw new Error("Descrição não pode ser vazia");
        }
        this.descricao = novaDescricao.trim();
    }
}
