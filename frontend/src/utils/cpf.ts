// Exporta a função/componente 'limparCPF' para uso em rotas ou outros componentes.
export function limparCPF(cpf: string): string {
  // Retorna cpf.replace(/\D/g, "").
  return cpf.replace(/\D/g, "");
}

// Exporta a função/componente 'mascararCPF' para uso em rotas ou outros componentes.
export function mascararCPF(valor: string): string {
  return limparCPF(valor)
    // Chamada: .slice(0, 11).
    .slice(0, 11)
    // Chamada: .replace(/(\d{3})(\d)/, "$1.$2").
    .replace(/(\d{3})(\d)/, "$1.$2")
    // Chamada: .replace(/(\d{3})(\d)/, "$1.$2").
    .replace(/(\d{3})(\d)/, "$1.$2")
    // Chamada: .replace(/(\d{3})(\d{1,2})$/, "$1-$2");.
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Exporta a função/componente 'validarCpf' para uso em rotas ou outros componentes.
export function validarCpf(cpf: string): boolean {
  // Declara constante 'numeros'.
  const numeros = limparCPF(cpf);

  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  // Atribuição: soma = 0;.
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros[i]) * (11 - i);
  }
  // Atribuição: resto = (soma * 10) % 11;.
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  // Retorna resto === parseInt(numeros[10]).
  return resto === parseInt(numeros[10]);
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Utilitários de validação/formatação de CPF no frontend.
