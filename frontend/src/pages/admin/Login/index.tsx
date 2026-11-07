import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const ShieldIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LoginIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
);

export default function LoginAdmin() {
  const [senha, setSenha] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (senha === "brito123") {
      sessionStorage.setItem("brito-admin-token", "token-simulado-123");
      navigate("/admin");
    } else {
      alert("Senha incorreta!");
    }
  };

  return (
    <main className={styles.loginPage}>
      <header className={styles.loginHeader}>
        <span className={styles.loginEyebrow}>
          <ShieldIcon />
          <span>// ÁREA ADMINISTRATIVA</span>
        </span>

        <h1 className={styles.loginTitle}>
          ENTRAR NO <span className={styles.loginTitleAccent}>PAINEL</span>
        </h1>

        <p className={styles.loginSubtitle}>
          Área exclusiva do administrador para gerenciar agendamentos.
        </p>
      </header>

      <section className={styles.loginCard}>
        <div className={styles.loginCardHeader}>
          <div className={styles.loginCardIcon}>
            <LockIcon />
          </div>
          <div>
            <span className={styles.loginCardEyebrow}>// CREDENCIAIS</span>
            <h2 className={styles.loginCardTitle}>LOGIN ADMIN</h2>
          </div>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <label className={styles.loginLabel} htmlFor="senha">
            SENHA
          </label>
          <input
            id="senha"
            className={styles.loginInput}
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />

          <button className={styles.loginButton} type="submit">
            <LoginIcon />
            <span>ENTRAR</span>
          </button>
        </form>

        <p className={styles.loginHint}>
          Senha padrão de teste: <code>brito123</code>
        </p>
        <a href="/" className={styles.voltar}> ← Voltar pro site</a>
      </section>
    </main>
  );
}
