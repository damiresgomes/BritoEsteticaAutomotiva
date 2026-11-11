import { validarEmail } from "./validarEmail";
import { mascararCPF, validarCpf } from "./cpf";

export type FormularioCadastro = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
};

export type ErrosFormulario = Partial<Record<keyof FormularioCadastro, string>>;

export function mascararTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  
  if (numeros.length <= 2) return numeros ? `(${numeros}` : "";
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

export function validarNivelSenha(senha: string): string | undefined {
  if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Z]/.test(senha)) return "A senha deve conter uma letra maiúscula.";
  if (!/[a-z]/.test(senha)) return "A senha deve conter uma letra minúscula.";
  if (!/[0-9]/.test(senha)) return "A senha deve conter um número.";
  if (!/[^A-Za-z0-9]/.test(senha)) return "A senha deve conter um símbolo.";
  return undefined;
}

export function validarCadastro(form: FormularioCadastro): ErrosFormulario {
  const erros: ErrosFormulario = {};

  if (!form.nome.trim()) {
    erros.nome = "Informe seu nome.";
  } else if (form.nome.trim().length > 100) {
    erros.nome = "O nome deve ter no máximo 100 caracteres.";
  }

  if (!form.email.trim()) {
    erros.email = "Informe seu email.";
  } else if (!validarEmail(form.email)) {
    erros.email = "Email inválido.";
  }

  if (!form.cpf.trim()) {
    erros.cpf = "Informe seu CPF.";
  } else if (!validarCpf(form.cpf)) {
    erros.cpf = "Informe um CPF válido.";
  }

  const telefoneNumerico = form.telefone.replace(/\D/g, "");
  if (!telefoneNumerico) {
    erros.telefone = "Informe seu telefone.";
  } else if (![10, 11].includes(telefoneNumerico.length)) {
    erros.telefone = "Informe um telefone com DDD e 10 ou 11 dígitos.";
  }

  if (!form.senha) {
    erros.senha = "Informe uma senha.";
  } else {
    const erroSenha = validarNivelSenha(form.senha);
    if (erroSenha) erros.senha = erroSenha;
  }

  if (!form.confirmarSenha) {
    erros.confirmarSenha = "Confirme sua senha.";
  } else if (form.senha !== form.confirmarSenha) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
}

export { mascararCPF };
