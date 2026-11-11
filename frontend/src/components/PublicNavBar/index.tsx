import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./styles.module.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/servico", label: "Serviços" },
  { to: "/sobre", label: "Sobre" },
  { to: "/agendamento", label: "Agendamento" },
  { to: "/autenticacao/login", label: "Login" },
];

export default function PublicNavBar() {
  const [aberto, setAberto] = useState(false);

  const fechar = () => setAberto(false);

  // Fecha o menu com a tecla Esc
  useEffect(() => {
    if (!aberto) return;

    const aoPressionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberto]);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoText} onClick={fechar}>
          Brito <span>Estética</span>
        </Link>

        <button
          type="button"
          className={`${styles.toggle} ${aberto ? styles.toggleAberto : ""}`}
          onClick={() => setAberto((valorAtual) => !valorAtual)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-principal"
        >
          <span className={styles.toggleBarra} />
          <span className={styles.toggleBarra} />
          <span className={styles.toggleBarra} />
        </button>

        <nav
          id="menu-principal"
          className={`${styles.nav} ${aberto ? styles.navAberto : ""}`}
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={fechar}
              className={({ isActive }) =>
                isActive ? `${styles.itemLink} ${styles.ativo}` : styles.itemLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}