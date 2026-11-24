// Cria a constante local 'DIAS_POR_MES'; usar const evita reatribuição acidental.
const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Declara a função local 'ehAnoBissexto'(ano: number) para encapsular lógica reutilizável neste arquivo.
function ehAnoBissexto(ano: number): boolean {
  // Retorna (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0 para quem chamou esta função.
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

// Declara a função local 'partesDaData'(valor: string) para encapsular lógica reutilizável neste arquivo.
function partesDaData(valor: string): { ano: number; mes: number; dia: number } | null {
  // Cria a constante local 'partes'; usar const evita reatribuição acidental.
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);

  // Condição: se '!partes' for verdadeira, o bloco abaixo é executado.
  if (!partes) {
    // Retorna null para quem chamou esta função.
    return null;
  }

  // Retorna { ano: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) } para quem chamou esta função.
  return { ano: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) };
}

// Exporta a função 'dataDeCalendarioValida'(valor: string) para ser reutilizada em outras camadas.
export function dataDeCalendarioValida(valor: string): boolean {
  // Cria a constante local 'partes'; usar const evita reatribuição acidental.
  const partes = partesDaData(valor);

  // Condição: se '!partes' for verdadeira, o bloco abaixo é executado.
  if (!partes) {
    // Retorna false para quem chamou esta função.
    return false;
  }

  const { ano, mes, dia } = partes;

  // Condição: se 'mes < 1 || mes > 12' for verdadeira, o bloco abaixo é executado.
  if (mes < 1 || mes > 12) {
    // Retorna false para quem chamou esta função.
    return false;
  }

  // Cria a constante local 'diasDoMes'; usar const evita reatribuição acidental.
  const diasDoMes = mes === 2 && ehAnoBissexto(ano) ? 29 : DIAS_POR_MES[mes - 1];

  // Retorna dia >= 1 && dia <= diasDoMes para quem chamou esta função.
  return dia >= 1 && dia <= diasDoMes;
}

// Exporta a função 'dataNaoEstaNoFuturo'(valor: string) para ser reutilizada em outras camadas.
export function dataNaoEstaNoFuturo(valor: string): boolean {
  // Retorna dataDeCalendarioValida(valor) && valor <= new Date().toISOString().slice(0, 10) para quem chamou esta função.
  return dataDeCalendarioValida(valor) && valor <= new Date().toISOString().slice(0, 10);
}

// Exporta a função 'temIdadeMinima'(valor: string, anosMinimos: number) para ser reutilizada em outras camadas.
export function temIdadeMinima(valor: string, anosMinimos: number): boolean {
  // Cria a constante local 'partes'; usar const evita reatribuição acidental.
  const partes = partesDaData(valor);

  // Condição: se '!partes' for verdadeira, o bloco abaixo é executado.
  if (!partes) {
    // Retorna false para quem chamou esta função.
    return false;
  }

  const { ano, mes, dia } = partes;
  // Cria a constante local 'hoje'; usar const evita reatribuição acidental.
  const hoje = new Date();
  // Cria a variável 'idade' com let, permitindo reatribuição quando necessário.
  let idade = hoje.getUTCFullYear() - ano;
  // Cria a constante local 'mesAtual'; usar const evita reatribuição acidental.
  const mesAtual = hoje.getUTCMonth() + 1;
  // Cria a constante local 'diaAtual'; usar const evita reatribuição acidental.
  const diaAtual = hoje.getUTCDate();

  // Condição: se 'mesAtual < mes || (mesAtual === mes && diaAtual < dia)' for verdadeira, o bloco abaixo é executado.
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade -= 1;
  }

  // Retorna idade >= anosMinimos para quem chamou esta função.
  return idade >= anosMinimos;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Validações/utilidades de data.
