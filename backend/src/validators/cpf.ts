function calculoDeCpfValido(digito: string): number {
  let soma = 0;
  let tamanho = digito.length + 1;

  for (const caractere of digito) {
    soma += Number(caractere) * tamanho;
    tamanho--;
  }

  const sobra = (soma * 10) % 11;
  return sobra === 10 ? 0 : sobra;
}

export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function cpfValido(cpf: string): boolean {
  const numeros = normalizarCpf(cpf);

  if (numeros.length !== 11) {
    return false;
  }

  if (/^(\d)\1+$/.test(numeros)) {
    return false;
  }

  const digito1 = calculoDeCpfValido(numeros.slice(0, 9));
  const digito2 = calculoDeCpfValido(numeros.slice(0, 10));

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}