import type { ReactNode } from "react";
import styles from "./styles.module.css";

type AuthLoginProps = {
  eyebrow: string;
  subtitulo: string;
  tituloCartao: string;
  children: ReactNode;
};

function ShieldIcon() {
  return (
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
}

function LockIcon() {
  return (
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
}

export function LoginIcon() {
  return (
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
}

export default function AuthLogin({ eyebrow, subtitulo, tituloCartao, children }: AuthLoginProps) {

  return (
    <main className={styles.loginPage}>
      <header className={styles.loginHeader}>

        <span className={styles.loginEyebrow}>
            <ShieldIcon />
            <span>{eyebrow}</span>
        </span>

        <h1 className={styles.loginTitle}>Entrar no painel</h1>

        <p className={styles.loginSubtitle}>{subtitulo}</p>
      </header>

      <section className={styles.loginCard}>
        <div className={styles.loginCardHeader}>
          <div className={styles.loginCardIcon}>
            <LockIcon />
          </div>

          <div>
            <span className={styles.loginCardEyebrow}>Credenciais</span>
            <h2 className={styles.loginCardTitle}>{tituloCartao}</h2>
          </div>

        </div>
        {children}
      </section>
    </main>
  );
}
