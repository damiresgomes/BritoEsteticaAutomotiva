export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{3,}$/.test(
    email.trim()
  );
}

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function validarCpf(cpf: string): boolean {
  const numeros = limparCPF(cpf);

  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros[i]) * (10 - i);
  }

  let resto = (soma * 10 ) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === parseInt(numeros[10]);
}
export function mascararCPF(valor: string): string {
  return limparCPF(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

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

export function mascararSalario(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "";

  const numero = Number(digitos) / 100;
  if (!Number.isFinite(numero)) return "";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function converterSalarioParaNumero(valor: string): number {
  return Number(valor.replace(/\./g, "").replace(",", "."));
}

export function dataLocalAtual(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function dataNaoEstaNoFuturo(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  const informada = new Date(ano, mes - 1, dia);
  if (
    informada.getFullYear() !== ano ||
    informada.getMonth() !== mes - 1 ||
    informada.getDate() !== dia
  ) {
    return false;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return informada <= hoje;
}

export function dataNaoEstaNoPassado(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  const informada = new Date(ano, mes - 1, dia);
  if (
    informada.getFullYear() !== ano ||
    informada.getMonth() !== mes - 1 ||
    informada.getDate() !== dia
  ) {
    return false;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return informada >= hoje;
}

export function temIdadeMinima(data: string, idadeMinima: number): boolean {
  if (!dataNaoEstaNoFuturo(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  const informada = new Date(ano, mes - 1, dia);

  const limite = new Date();
  limite.setHours(0, 0, 0, 0);
  limite.setFullYear(limite.getFullYear() - idadeMinima);

  return informada <= limite;
}