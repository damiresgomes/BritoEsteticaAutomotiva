import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

type HeaderAdminLink = {
  to: string;
  label: string;
};

type HeaderAdminProps = {
  titulo: string;
  links: HeaderAdminLink[];
  breadcrumb?: string;
};

export default function HeaderAdmin({ titulo, links, breadcrumb = "// CADASTROS" }: HeaderAdminProps) {
  
  return (
    <header className={styles.headerSection}>
      <span className={styles.breadcrumb}>{breadcrumb}</span>
      <h1 className={styles.title}>{titulo}</h1>

      <nav className={styles.tabsContainer} aria-label={`Navegação de ${titulo}`}>
        {links.map(({ to, label }) => (
          <NavLink
            // Atribuição: key={to}.
            key={to}
            // Atribuição: to={to}.
            to={to}
            end
            // Atribuição: className={({ isActive }) =>.
            className={({ isActive }) =>
              `${styles.tabItem} ${isActive ? styles.tabActive : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/HeaderAdmin/index.tsx) com sua lógica de apresentação.
