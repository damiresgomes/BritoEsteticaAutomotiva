export function limparPlaca(placa: string): string {
  return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function caracterePermitido(caractere: string, posicao: number): boolean {
  if (posicao < 3) {
    return caractere >= "A" && caractere <= "Z";
  }
  if (posicao === 3 || posicao === 5 || posicao === 6) {
    return caractere >= "0" && caractere <= "9";
  }
  return true;
}

export function mascararPlaca(valor: string): string {
  let placa = "";

  for (const caractere of limparPlaca(valor)) {
    if (placa.length === 7) break;
    if (caracterePermitido(caractere, placa.length)) {
      placa += caractere;
    }
  }

  return placa.length > 3 ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
}

export function validarPlaca(valor: string): boolean {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(limparPlaca(valor));
}
