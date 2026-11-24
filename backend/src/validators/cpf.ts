// Declara a função local 'calculoDeCpfValido'(digito: string) para encapsular lógica reutilizável neste arquivo.
function calculoDeCpfValido(digito: string): number {
  // Cria a variável 'soma' com let, permitindo reatribuição quando necessário.
  let soma = 0;
  // Cria a variável 'tamanho' com let, permitindo reatribuição quando necessário.
  let tamanho = digito.length + 1;

  // Inicia laço for com 'const caractere of digito', repetindo o bloco para cada iteração.
  for (const caractere of digito) {
    soma += Number(caractere) * tamanho;
    tamanho--;
  }

  // Cria a constante local 'sobra'; usar const evita reatribuição acidental.
  const sobra = (soma * 10) % 11;
  // Retorna sobra === 10 ? 0 : sobra para quem chamou esta função.
  return sobra === 10 ? 0 : sobra;
}

// Exporta a função 'normalizarCpf'(cpf: string) para ser reutilizada em outras camadas.
export function normalizarCpf(cpf: string): string {
  // Retorna cpf.replace(/\D/g, "") para quem chamou esta função.
  return cpf.replace(/\D/g, "");
}

// Exporta a função 'cpfValido'(cpf: string) para ser reutilizada em outras camadas.
export function cpfValido(cpf: string): boolean {
  // Cria a constante local 'numeros'; usar const evita reatribuição acidental.
  const numeros = normalizarCpf(cpf);

  // Condição: se 'numeros.length !== 11' for verdadeira, o bloco abaixo é executado.
  if (numeros.length !== 11) {
    // Retorna false para quem chamou esta função.
    return false;
  }

  // Condição: se '/^(\d)\1+$/.test(numeros)' for verdadeira, o bloco abaixo é executado.
  if (/^(\d)\1+$/.test(numeros)) {
    // Retorna false para quem chamou esta função.
    return false;
  }

  // Cria a constante local 'digito1'; usar const evita reatribuição acidental.
  const digito1 = calculoDeCpfValido(numeros.slice(0, 9));
  // Cria a constante local 'digito2'; usar const evita reatribuição acidental.
  const digito2 = calculoDeCpfValido(numeros.slice(0, 10));

  // Retorna digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]) para quem chamou esta função.
  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Valida CPF (dígitos verificadores/formato) para uso em schemas/regras.
