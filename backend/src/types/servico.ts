export interface Servico {
    id_servico: number;
    nome_servico: string;
    descricao: string;
    preco: number;
    duracao_horas: number;
    id_categoria: number;
}

export interface NovoServico {
    nome_servico: string;
    descricao: string;
    preco: number;
    duracao_horas: number;
    id_categoria: number;
}