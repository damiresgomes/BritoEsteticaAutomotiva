import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

interface BotaoProps {
    children: ReactNode;
    variante?: "primario" | "secundario";
    to?: string;
    href?: string;
}

export default function Botao ({ children, variante = "primario", to, href }: BotaoProps) {
    // Declara constante 'className'.
    const className = `${styles.botao} ${styles[variante]}`;

    // Condição: to.
    if (to) {
        // Retorna <Link to={to} className={className}>{children}</Link>.
        return <Link to={to} className={className}>{children}</Link>;
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    )
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente React reutilizável (frontend/src/components/Botao/index.tsx) com sua lógica de apresentação.
