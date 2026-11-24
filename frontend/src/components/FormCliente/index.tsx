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
          // Atribuição: id="nome".
          id="nome"
          // Atribuição: name="nome".
          name="nome"
          // Atribuição: autoComplete="name".
          autoComplete="name"
          // Atribuição: value={form.nome}.
          value={form.nome}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: id="cpf".
          id="cpf"
          // Atribuição: name="cpf".
          name="cpf"
          // Atribuição: inputMode="numeric".
          inputMode="numeric"
          // Atribuição: autoComplete="tax-id".
          autoComplete="tax-id"
          // Atribuição: maxLength={14}.
          maxLength={14}
          // Atribuição: placeholder="000.000.000-00".
          placeholder="000.000.000-00"
          // Atribuição: value={form.cpf}.
          value={form.cpf}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: id="email".
          id="email"
          // Atribuição: name="email".
          name="email"
          // Atribuição: type="email".
          type="email"
          // Atribuição: autoComplete="email".
          autoComplete="email"
          // Atribuição: value={form.email}.
          value={form.email}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: id="telefone".
          id="telefone"
          // Atribuição: name="telefone".
          name="telefone"
          // Atribuição: type="tel".
          type="tel"
          // Atribuição: inputMode="tel".
          inputMode="tel"
          // Atribuição: autoComplete="tel".
          autoComplete="tel"
          // Atribuição: maxLength={16}.
          maxLength={16}
          // Atribuição: placeholder="(19) 98765-4321".
          placeholder="(19) 98765-4321"
          // Atribuição: value={form.telefone}.
          value={form.telefone}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: id="senha".
          id="senha"
          // Atribuição: name="senha".
          name="senha"
          // Atribuição: type="password".
          type="password"
          // Atribuição: autoComplete="new-password".
          autoComplete="new-password"
          // Atribuição: maxLength={72}.
          maxLength={72}
          // Atribuição: value={form.senha}.
          value={form.senha}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: id="confirmarSenha".
          id="confirmarSenha"
          // Atribuição: name="confirmarSenha".
          name="confirmarSenha"
          // Atribuição: type="password".
          type="password"
          // Atribuição: autoComplete="new-password".
          autoComplete="new-password"
          // Atribuição: value={form.confirmarSenha}.
          value={form.confirmarSenha}
          // Atribuição: onChange={onChange}.
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
          // Atribuição: className={styles.botaoEnvio}.
          className={styles.botaoEnvio}
          // Atribuição: type="submit".
          type="submit"
          // Atribuição: disabled={carregando}.
          disabled={carregando}
        >
          {carregando ? "CADASTRANDO..." : "CADASTRAR"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Já tem uma conta?{" "}
        <Link to="/autenticacao/LoginCliente" state={{ from }}>
          Acesse o login
        </Link>
      </p>
    </>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/FormCliente/index.tsx) com sua lógica de apresentação.
