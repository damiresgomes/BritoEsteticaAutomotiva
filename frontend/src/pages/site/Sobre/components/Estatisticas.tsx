import styles from "../styles.module.css";
import { estatisticas } from "../dados/estatisticas";

export default function Estatisticas () {
    return (
        <section className={styles.statsSection}>
            <div className={styles.statsContainer}>
                {estatisticas.map(({ valor, rotulo }) => (
                    <div key={rotulo} className={styles.statCard}>
                        <span className={styles.statValue}>{valor}</span>
                        <span className={styles.statLabel}>{rotulo}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Sobre/components/Estatisticas.tsx) responsável por renderizar UI e orquestrar interações do usuário.
