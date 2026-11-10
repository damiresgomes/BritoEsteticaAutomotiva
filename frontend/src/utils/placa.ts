export function limparPlaca(placa: string): string {
  return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function mascararPlaca(valor: string): string {
  const placa = limparPlaca(valor).slice(0, 7);
  return placa.length > 3 ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
}

export function validarPlaca(valor: string): boolean {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(limparPlaca(valor));
}
