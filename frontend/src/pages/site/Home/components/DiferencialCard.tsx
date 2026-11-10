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