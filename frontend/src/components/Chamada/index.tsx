import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface ChamadaProps {
    titulo: ReactNode;
    descricao: string;
    children: ReactNode;
    rodape?: ReactNode;
}

export default function Chamada ({titulo, descricao, children, rodape}: ChamadaProps) {
    return (
        <section className={styles.chamada}>
            <div className={styles.container}>
                <h2 className={styles.titulo}>{titulo}</h2>
                <p className={styles.descricao}>{descricao}</p>
                <div className={styles.botoes}>{children}</div>
                {rodape && <div className={styles.rodape}>{rodape}</div>}
            </div>
        </section>
    );
}