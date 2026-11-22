import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUsuario } from "../../contexts/useUsuario";
import { authService } from "../../services/auth";
import styles from "./styles.module.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/servico", label: "Serviços" },
  { to: "/sobre", label: "Sobre" },
  { to: "/agendamento", label: "Agendamento" },
];

function getIniciais(nome?: string) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

export default function PublicNavBar() {
  const { cliente } = useUsuario();
  const [aberto, setAberto] = useState(false);

  const fechar = () => setAberto(false);
  const clienteLogado = Boolean(cliente) || authService.isAuthenticated("cliente");
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

          {clienteLogado ? (
            <Link
              to="/minha-conta"
              onClick={fechar}
              className={`${styles.itemLink} ${styles.perfilLink}`}
            >
              <span className={styles.avatar}>{getIniciais(cliente?.nome)}</span>
              <span>{cliente?.nome ?? "Meu perfil"}</span>
            </Link>
          ) : (
            <NavLink
              to="/autenticacao/LoginCliente"
              onClick={fechar}
              className={({ isActive }) =>
                isActive ? `${styles.itemLink} ${styles.ativo}` : styles.itemLink
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}