// Exporta a função/componente 'dataLocalAtual' para uso em rotas ou outros componentes.
export function dataLocalAtual(): string {
  // Declara constante 'hoje'.
  const hoje = new Date();
  // Declara constante 'ano'.
  const ano = hoje.getFullYear();
  // Declara constante 'mes'.
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  // Declara constante 'dia'.
  const dia = String(hoje.getDate()).padStart(2, "0");

  // Retorna `${ano}-${mes}-${dia}`.
  return `${ano}-${mes}-${dia}`;
}

// Exporta a função/componente 'dataEhDomingo' para uso em rotas ou outros componentes.
export function dataEhDomingo(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  // Retorna new Date(ano, mes - 1, dia).getDay() === 0.
  return new Date(ano, mes - 1, dia).getDay() === 0;
}

// Exporta a função/componente 'dataNaoEstaNoPassado' para uso em rotas ou outros componentes.
export function dataNaoEstaNoPassado(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  // Declara constante 'informada'.
  const informada = new Date(ano, mes - 1, dia);
  if (
    // Chamada: informada.getFullYear() !== ano ||.
    informada.getFullYear() !== ano ||
    // Chamada: informada.getMonth() !== mes - 1 ||.
    informada.getMonth() !== mes - 1 ||
    // Chamada: informada.getDate() !== dia.
    informada.getDate() !== dia
  ) {
    // Retorna false.
    return false;
  }

  // Declara constante 'hoje'.
  const hoje = new Date();
  // Chamada: hoje.setHours(0, 0, 0, 0);.
  hoje.setHours(0, 0, 0, 0);

  // Retorna informada >= hoje.
  return informada >= hoje;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Utilitários de data/hora para formulários e exibição.
