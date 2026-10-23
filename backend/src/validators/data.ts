const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function ehAnoBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

function partesDaData(valor: string): { ano: number; mes: number; dia: number } | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);

  if (!partes) {
    return null;
  }

  return { ano: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) };
}

export function dataDeCalendarioValida(valor: string): boolean {
  const partes = partesDaData(valor);

  if (!partes) {
    return false;
  }

  const { ano, mes, dia } = partes;

  if (mes < 1 || mes > 12) {
    return false;
  }

  const diasDoMes = mes === 2 && ehAnoBissexto(ano) ? 29 : DIAS_POR_MES[mes - 1];

  return dia >= 1 && dia <= diasDoMes;
}

export function dataNaoEstaNoFuturo(valor: string): boolean {
  return dataDeCalendarioValida(valor) && valor <= new Date().toISOString().slice(0, 10);
}

export function temIdadeMinima(valor: string, anosMinimos: number): boolean {
  const partes = partesDaData(valor);

  if (!partes) {
    return false;
  }

  const { ano, mes, dia } = partes;
  const hoje = new Date();
  let idade = hoje.getUTCFullYear() - ano;
  const mesAtual = hoje.getUTCMonth() + 1;
  const diaAtual = hoje.getUTCDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade -= 1;
  }

  return idade >= anosMinimos;
}
