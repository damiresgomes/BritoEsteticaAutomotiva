// Exporta a função/componente 'limparPlaca' para uso em rotas ou outros componentes.
export function limparPlaca(placa: string): string {
  // Retorna placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().
  return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function caracterePermitido(caractere: string, posicao: number): boolean {
  // Condição: posicao < 3.
  if (posicao < 3) {
    // Retorna caractere >= "A" && caractere <= "Z".
    return caractere >= "A" && caractere <= "Z";
  }
  // Condição: posicao === 3 || posicao === 5 || posicao === 6.
  if (posicao === 3 || posicao === 5 || posicao === 6) {
    // Retorna caractere >= "0" && caractere <= "9".
    return caractere >= "0" && caractere <= "9";
  }
  // Retorna true.
  return true;
}

// Exporta a função/componente 'mascararPlaca' para uso em rotas ou outros componentes.
export function mascararPlaca(valor: string): string {
  let placa = "";

  for (const caractere of limparPlaca(valor)) {
    if (placa.length === 7) break;
    // Condição: caracterePermitido(caractere, placa.length).
    if (caracterePermitido(caractere, placa.length)) {
      placa += caractere;
    }
  }

  // Retorna placa.length > 3 ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa.
  return placa.length > 3 ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
}

// Exporta a função/componente 'validarPlaca' para uso em rotas ou outros componentes.
export function validarPlaca(valor: string): boolean {
  // Retorna /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(limparPlaca(valor)).
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(limparPlaca(valor));
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Validação/formatação de placa de veículo.
