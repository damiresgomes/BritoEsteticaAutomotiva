import styles from "./styles.module.css";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormCliente from "../../../components/FormCliente";
import {
  mascararTelefone,
  mascararCPF,
  validarCadastro,
} from "../../../utils/cadastro";
import type {
  ErrosFormulario,
  FormularioCadastro,
} from "../../../utils/cadastro";
import { authService } from "../../../services/auth";
import { obterMensagemErro } from "../../../utils/erros";

export default function CadastroUsuario() {
  // Hook de navegação: 'navigate' permite redirecionar programaticamente.
  const navigate = useNavigate();
  // Hook useLocation: acessa URL/estado atual da navegação em 'location'.
  const location = useLocation();
  // Declara constante 'estado'.
  const estado = location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null;

  // Estado React: [form, setForm] criado com useState; atualizar o setter causa re-render do componente.
  const [form, setForm] = useState<FormularioCadastro>({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });

  // Estado React: [erros, setErros] criado com useState; atualizar o setter causa re-render do componente.
  const [erros, setErros] = useState<ErrosFormulario>({});
  // Estado React: [erroApi, setErroApi] criado com useState; atualizar o setter causa re-render do componente.
  const [erroApi, setErroApi] = useState("");
  // Estado React: [carregando, setCarregando] criado com useState; atualizar o setter causa re-render do componente.
  const [carregando, setCarregando] = useState(false);

  function mudancaInput(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target;
    // Declara constante 'novoValor'.
    const novoValor = name === "telefone"
      ? mascararTelefone(value)
      : name === "cpf"
        ? mascararCPF(value)
        : value;

    // Chamada: setForm((anterior) => ({ ...anterior, [name]: novoValor }));.
    setForm((anterior) => ({ ...anterior, [name]: novoValor }));
    // Chamada: setErros((anterior) => ({ ...anterior, [name]: undefined }));.
    setErros((anterior) => ({ ...anterior, [name]: undefined }));
  }

  async function mudancaBotao(evento: FormEvent<HTMLFormElement>) {
    // Chamada: evento.preventDefault();.
    evento.preventDefault();
    // Chamada: setErroApi("");.
    setErroApi("");

    // Declara constante 'novosErros'.
    const novosErros = validarCadastro(form);
    // Chamada: setErros(novosErros);.
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    // Chamada: setCarregando(true);.
    setCarregando(true);

    // Bloco try: captura erros de chamadas assíncronas/rede/validação.
    try {
      // Aguarda operação assíncrona: authService.cadastrarCliente({.
      await authService.cadastrarCliente({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf,
        senha: form.senha,
        telefone: form.telefone,
      });

      // Chamada: navigate("/autenticacao/LoginCliente", {.
      navigate("/autenticacao/LoginCliente", {
        replace: true,
        state: { registrado: true, from: estado?.from },
      });
    } catch (erro) {
      // Chamada: setErroApi(obterMensagemErro(erro));.
      setErroApi(obterMensagemErro(erro));
    } finally {
      // Chamada: setCarregando(false);.
      setCarregando(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="cadastro-title">
        <p className={styles.eyebrow}>// NOVA CONTA</p>
        <h1 className={styles.title} id="cadastro-title">
          CRIAR CONTA
        </h1>
        <p className={styles.subtitle}>
          Preencha seus dados para se cadastrar.
        </p>

        <FormCliente
          // Atribuição: form={form}.
          form={form}
          // Atribuição: erros={erros}.
          erros={erros}
          // Atribuição: erroApi={erroApi}.
          erroApi={erroApi}
          // Atribuição: carregando={carregando}.
          carregando={carregando}
          // Atribuição: from={estado?.from}.
          from={estado?.from}
          // Atribuição: onChange={mudancaInput}.
          onChange={mudancaInput}
          // Atribuição: onSubmit={mudancaBotao}.
          onSubmit={mudancaBotao}
        />
      </section>
    </main>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/autenticacao/CadastrarCliente/index.tsx) responsável por renderizar UI e orquestrar interações do usuário.
