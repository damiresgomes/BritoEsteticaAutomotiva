// Declara a interface 'Servico' para definir o contrato/forma de dados em TypeScript.
export interface Servico {
    // Define a propriedade/campo 'id_servico' no objeto/estrutura.
    id_servico: number;
    // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
    nome_servico: string;
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: string;
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: number;
    // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
    duracao_horas: number;
    // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
    id_categoria: number;
}

// Declara a interface 'NovoServico' para definir o contrato/forma de dados em TypeScript.
export interface NovoServico {
    // Define a propriedade/campo 'nome_servico' no objeto/estrutura.
    nome_servico: string;
    // Define a propriedade/campo 'descricao' no objeto/estrutura.
    descricao: string;
    // Define a propriedade/campo 'preco' no objeto/estrutura.
    preco: number;
    // Define a propriedade/campo 'duracao_horas' no objeto/estrutura.
    duracao_horas: number;
    // Define a propriedade/campo 'id_categoria' no objeto/estrutura.
    id_categoria: number;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Tipos TypeScript auxiliares para serviço.
