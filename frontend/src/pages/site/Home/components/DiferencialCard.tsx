import styles from "../styles.module.css"

interface DiferencialCardProps {
    numero: string;
    titulo: string;
    texto: string;
}

export default function DeferencialCard ({numero, titulo, texto}: DiferencialCardProps) {
    return (
        <div className={styles.cardItem}>
            <div className={styles.cardHeaderCustom}>
                <span className={styles.cardNumero}>{numero}</span>
            </div>

            <h3 className={styles.cardTitle}>{titulo}</h3>
            <p className={styles.cardText}>{texto}</p>
        </div>
    )
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Home/components/DiferencialCard.tsx) responsável por renderizar UI e orquestrar interações do usuário.
