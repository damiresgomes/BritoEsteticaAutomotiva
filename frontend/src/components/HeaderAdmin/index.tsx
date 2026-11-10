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

export default function HeaderAdmin({
  titulo,
  links,
  breadcrumb = "// CADASTROS",
}: HeaderAdminProps) {
  return (
    <header className={styles.headerSection}>
      <span className={styles.breadcrumb}>{breadcrumb}</span>
      <h1 className={styles.title}>{titulo}</h1>

      <nav className={styles.tabsContainer} aria-label={`Navegação de ${titulo}`}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
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
