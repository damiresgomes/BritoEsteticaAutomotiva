import { validarEmail } from "./validarEmail";
import { mascararCPF, validarCpf } from "./cpf";

// Define e exporta o tipo 'FormularioCadastro'.
export type FormularioCadastro = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
};

// Define e exporta o tipo 'ErrosFormulario'.
export type ErrosFormulario = Partial<Record<keyof FormularioCadastro, string>>;

// Exporta a função/componente 'mascararTelefone' para uso em rotas ou outros componentes.
export function mascararTelefone(valor: string): string {
  // Declara constante 'numeros'.
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  
  if (numeros.length <= 2) return numeros ? `(${numeros}` : "";
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  // Condição: numeros.length <= 10.
  if (numeros.length <= 10) {
    // Retorna `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`.
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  // Retorna `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`.
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

// Exporta a função/componente 'validarNivelSenha' para uso em rotas ou outros componentes.
export function validarNivelSenha(senha: string): string | undefined {
  if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Z]/.test(senha)) return "A senha deve conter uma letra maiúscula.";
  if (!/[a-z]/.test(senha)) return "A senha deve conter uma letra minúscula.";
  if (!/[0-9]/.test(senha)) return "A senha deve conter um número.";
  if (!/[^A-Za-z0-9]/.test(senha)) return "A senha deve conter um símbolo.";
  // Retorna undefined.
  return undefined;
}

// Exporta a função/componente 'validarCadastro' para uso em rotas ou outros componentes.
export function validarCadastro(form: FormularioCadastro): ErrosFormulario {
  const erros: ErrosFormulario = {};

  // Condição: !form.nome.trim().
  if (!form.nome.trim()) {
    // Atribuição: erros.nome = "Informe seu nome.";.
    erros.nome = "Informe seu nome.";
  } else if (form.nome.trim().length > 100) {
    // Atribuição: erros.nome = "O nome deve ter no máximo 100 caracteres.";.
    erros.nome = "O nome deve ter no máximo 100 caracteres.";
  }

  // Condição: !form.email.trim().
  if (!form.email.trim()) {
    // Atribuição: erros.email = "Informe seu email.";.
    erros.email = "Informe seu email.";
  } else if (!validarEmail(form.email)) {
    // Atribuição: erros.email = "Email inválido.";.
    erros.email = "Email inválido.";
  }

  // Condição: !form.cpf.trim().
  if (!form.cpf.trim()) {
    // Atribuição: erros.cpf = "Informe seu CPF.";.
    erros.cpf = "Informe seu CPF.";
  } else if (!validarCpf(form.cpf)) {
    // Atribuição: erros.cpf = "Informe um CPF válido.";.
    erros.cpf = "Informe um CPF válido.";
  }

  // Declara constante 'telefoneNumerico'.
  const telefoneNumerico = form.telefone.replace(/\D/g, "");
  // Condição: !telefoneNumerico.
  if (!telefoneNumerico) {
    // Atribuição: erros.telefone = "Informe seu telefone.";.
    erros.telefone = "Informe seu telefone.";
  } else if (![10, 11].includes(telefoneNumerico.length)) {
    // Atribuição: erros.telefone = "Informe um telefone com DDD e 10 ou 11 dígitos.";.
    erros.telefone = "Informe um telefone com DDD e 10 ou 11 dígitos.";
  }

  // Condição: !form.senha.
  if (!form.senha) {
    // Atribuição: erros.senha = "Informe uma senha.";.
    erros.senha = "Informe uma senha.";
  } else {
    // Declara constante 'erroSenha'.
    const erroSenha = validarNivelSenha(form.senha);
    if (erroSenha) erros.senha = erroSenha;
  }

  // Condição: !form.confirmarSenha.
  if (!form.confirmarSenha) {
    // Atribuição: erros.confirmarSenha = "Confirme sua senha.";.
    erros.confirmarSenha = "Confirme sua senha.";
  } else if (form.senha !== form.confirmarSenha) {
    // Atribuição: erros.confirmarSenha = "As senhas não coincidem.";.
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  // Retorna erros.
  return erros;
}

export { mascararCPF };

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Utilitários de validação de cadastro/senha/confirmação.
