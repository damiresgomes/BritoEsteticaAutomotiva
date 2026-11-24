// Define e exporta a interface 'Estatistica' para tipagem.
export interface Estatistica  {
    valor: string;
    rotulo: string;
}

// Exporta a constante 'estatisticas'.
export const estatisticas: Estatistica[] = [
    { valor: "2014", rotulo: "FUNDADA EM" },
    { valor: "+8.500", rotulo: "VEÍCULOS DETALHADOS" },
    { valor: "+12", rotulo: "PROFISSIONAIS FORMADOS" },
    { valor: "4.9★", rotulo: "AVALIAÇÃO GOOGLE" },
]

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Sobre/dados/estatisticas.ts) responsável por renderizar UI e orquestrar interações do usuário.
