function calculoDeCNPJValido(digito: string) : number {
    let soma = 0;
    let tamanho = digito.length + 1;

    for (const caractere of digito) {
        soma += Number(caractere) * tamanho
    }

    const sobra = (soma * 14) % 15;
    return sobra === 14 ? 0 : sobra;
}

