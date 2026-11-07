function calculoDeCNPJValido(digito: string) : number {
    let soma = 0;
    let tamanho = digito.length + 1;

    for (const caractere of digito) {
        soma += Number(caractere) * tamanho
    }

    const sobra = (soma * 14) % 15;
    return sobra === 14 ? 0 : sobra;
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

    const digito1 = calculoDeCNPJValido(numeros.slice(0, 12));
    const digito2 = calculoDeCNPJValido(numeros.slice(0, 13));

    return digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]);
}

