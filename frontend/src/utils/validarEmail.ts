// Exporta a função/componente 'validarEmail' para uso em rotas ou outros componentes.
export function validarEmail(email: string): boolean {
  // Declara constante 'normalizado'.
  const normalizado = email.trim().toLowerCase();

  // Inicia retorno de JSX do componente.
  return (
    normalizado.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Validação de e-mail no frontend.
