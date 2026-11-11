import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { ErrosFormulario, FormularioCadastro } from "../../utils/cadastro";
import styles from "./styles.module.css";

type FormClienteProps = {
  form: FormularioCadastro;
  erros: ErrosFormulario;
  erroApi: string;
  carregando: boolean;
  from?: { pathname?: string; search?: string; hash?: string };
  onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
};

export default function FormCliente({
  form,
  erros,
  erroApi,
  carregando,
  from,
  onChange,
  onSubmit,
}: FormClienteProps) {
  return (
    <>
      <form className={styles.formulario} onSubmit={onSubmit} noValidate>
        <div className={styles.campo}>
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          name="nome"
          autoComplete="name"
          value={form.nome}
          onChange={onChange}
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? "nome-erro" : undefined}
          required
        />
        {erros.nome && (
          <span className={styles.campoErro} id="nome-erro">
            {erros.nome}
          </span>
        )}
        </div>

        <div className={styles.campo}>
        <label htmlFor="cpf">CPF</label>
        <input
          id="cpf"
          name="cpf"
          inputMode="numeric"
          autoComplete="tax-id"
          maxLength={14}
          placeholder="000.000.000-00"
          value={form.cpf}
          onChange={onChange}
          aria-invalid={Boolean(erros.cpf)}
          aria-describedby={erros.cpf ? "cpf-erro" : undefined}
          required
        />
        {erros.cpf && (
          <span className={styles.campoErro} id="cpf-erro">
            {erros.cpf}
          </span>
        )}
        </div>

        <div className={styles.campo}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          aria-invalid={Boolean(erros.email)}
          aria-describedby={erros.email ? "email-erro" : undefined}
          required
        />
        {erros.email && (
          <span className={styles.campoErro} id="email-erro">
            {erros.email}
          </span>
        )}
        </div>

        <div className={styles.campo}>
        <label htmlFor="telefone">Telefone</label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          placeholder="(19) 98765-4321"
          value={form.telefone}
          onChange={onChange}
          aria-invalid={Boolean(erros.telefone)}
          aria-describedby={erros.telefone ? "telefone-erro" : undefined}
          required
        />
        {erros.telefone && (
          <span className={styles.campoErro} id="telefone-erro">
            {erros.telefone}
          </span>
        )}
        </div>

        <div className={styles.campo}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          value={form.senha}
          onChange={onChange}
          aria-invalid={Boolean(erros.senha)}
          aria-describedby={erros.senha ? "senha-erro" : undefined}
          required
        />
        {erros.senha && (
          <span className={styles.campoErro} id="senha-erro">
            {erros.senha}
          </span>
        )}
        </div>

        <div className={styles.campo}>
        <label htmlFor="confirmarSenha">Confirme sua senha</label>
        <input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          autoComplete="new-password"
          value={form.confirmarSenha}
          onChange={onChange}
          aria-invalid={Boolean(erros.confirmarSenha)}
          aria-describedby={
            erros.confirmarSenha ? "confirmarSenha-erro" : undefined
          }
          required
        />
        {erros.confirmarSenha && (
          <span className={styles.campoErro} id="confirmarSenha-erro">
            {erros.confirmarSenha}
          </span>
        )}
        </div>

        {erroApi && (
          <p className={styles.apiErro} role="alert">
            {erroApi}
          </p>
        )}

        <button
          className={styles.botaoEnvio}
          type="submit"
          disabled={carregando}
        >
          {carregando ? "CADASTRANDO..." : "CADASTRAR"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Já tem uma conta?{" "}
        <Link to="/auth/login" state={{ from }}>
          Acesse o login
        </Link>
      </p>
    </>
  );
}
