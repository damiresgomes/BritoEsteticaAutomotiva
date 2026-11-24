// Cria a constante local 'PESOS_PRIMEIRO_DIGITO'; usar const evita reatribuição acidental.
const PESOS_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
// Cria a constante local 'PESOS_SEGUNDO_DIGITO'; usar const evita reatribuição acidental.
const PESOS_SEGUNDO_DIGITO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

// Declara a função local 'calcularDigito'(digitos: string, pesos: number[]) para encapsular lógica reutilizável neste arquivo.
function calcularDigito(digitos: string, pesos: number[]): number {
    // Cria a variável 'soma' com let, permitindo reatribuição quando necessário.
    let soma = 0;

    // Inicia laço for com 'let indice = 0; indice < pesos.length; indice++', repetindo o bloco para cada iteração.
    for (let indice = 0; indice < pesos.length; indice++) {
        soma += Number(digitos[indice]) * pesos[indice];
    }

    // Cria a constante local 'resto'; usar const evita reatribuição acidental.
    const resto = soma % 11;
    // Retorna resto < 2 ? 0 : 11 - resto para quem chamou esta função.
    return resto < 2 ? 0 : 11 - resto;
}

// Exporta a função 'normalizarCNPJ'(cnpj: string) para ser reutilizada em outras camadas.
export function normalizarCNPJ(cnpj: string): string {
    // Retorna cnpj.replace(/\D/g, "") para quem chamou esta função.
    return cnpj.replace(/\D/g, "");
}

// Exporta a função 'cnpjValido'(cnpj: string) para ser reutilizada em outras camadas.
export function cnpjValido(cnpj: string): boolean {
    // Cria a constante local 'numeros'; usar const evita reatribuição acidental.
    const numeros = normalizarCNPJ(cnpj);

    // Condição: se 'numeros.length !== 14' for verdadeira, o bloco abaixo é executado.
    if (numeros.length !== 14) {
        // Retorna false para quem chamou esta função.
        return false;
    }

    // Condição: se '/^(\d)\1+$/.test(numeros)' for verdadeira, o bloco abaixo é executado.
    if (/^(\d)\1+$/.test(numeros)) {
        // Retorna false para quem chamou esta função.
        return false;
    }

    // Cria a constante local 'digito1'; usar const evita reatribuição acidental.
    const digito1 = calcularDigito(numeros.slice(0, 12), PESOS_PRIMEIRO_DIGITO);
    // Cria a constante local 'digito2'; usar const evita reatribuição acidental.
    const digito2 = calcularDigito(numeros.slice(0, 13), PESOS_SEGUNDO_DIGITO);

    // Retorna digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]) para quem chamou esta função.
    return digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]);
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Valida CNPJ quando aplicável.
