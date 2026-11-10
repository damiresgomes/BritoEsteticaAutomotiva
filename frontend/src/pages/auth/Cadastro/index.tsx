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
  const navigate = useNavigate();
  const location = useLocation();
  const estado = location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null;

  const [form, setForm] = useState<FormularioCadastro>({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroApi, setErroApi] = useState("");
  const [carregando, setCarregando] = useState(false);

  function mudancaInput(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target;
    const novoValor = name === "telefone"
      ? mascararTelefone(value)
      : name === "cpf"
        ? mascararCPF(value)
        : value;

    setForm((anterior) => ({ ...anterior, [name]: novoValor }));
    setErros((anterior) => ({ ...anterior, [name]: undefined }));
  }

  async function mudancaBotao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroApi("");

    const novosErros = validarCadastro(form);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);

    try {
      await authService.cadastrarCliente({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf,
        senha: form.senha,
        telefone: form.telefone,
      });

      navigate("/autenticacao/login", {
        replace: true,
        state: { registrado: true, from: estado?.from },
      });
    } catch (erro) {
      setErroApi(obterMensagemErro(erro));
    } finally {
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
          form={form}
          erros={erros}
          erroApi={erroApi}
          carregando={carregando}
          from={estado?.from}
          onChange={mudancaInput}
          onSubmit={mudancaBotao}
        />
      </section>
    </main>
  );
}
