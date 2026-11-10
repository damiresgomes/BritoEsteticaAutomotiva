const PESOS_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_SEGUNDO_DIGITO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function calcularDigito(digitos: string, pesos: number[]): number {
    let soma = 0;

    for (let indice = 0; indice < pesos.length; indice++) {
        soma += Number(digitos[indice]) * pesos[indice];
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}

export function normalizarCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
}

export function cnpjValido(cnpj: string): boolean {
    const numeros = normalizarCNPJ(cnpj);

    if (numeros.length !== 14) {
        return false;
    }

    if (/^(\d)\1+$/.test(numeros)) {
        return false;
    }

    const digito1 = calcularDigito(numeros.slice(0, 12), PESOS_PRIMEIRO_DIGITO);
    const digito2 = calcularDigito(numeros.slice(0, 13), PESOS_SEGUNDO_DIGITO);

    return digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]);
}

