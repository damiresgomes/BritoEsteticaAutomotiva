import styles from "../styles.module.css";

import DiferencialCard from "./DiferencialCard";
import { diferenciais } from "../data/diferenciais";

export default function Diferencias () {
    return (
        <section className={styles.diferenciais}>
            <div className={styles.container}>
                <div>
                    <h2 className={styles.titulo}>
                        POR QUE ESCOLHER A
                        <br />
                        <span className={styles.span}>BRITO ESTÉTICA AUTOMOTIVA?</span>
                    </h2>

                    <p className={styles.descricao}>Quatro pilares que sustentam cada serviço entregue na Brito
                    Estética — do primeiro enxágue ao último detalhe.</p>
                </div>

                <div className={styles.cardsGrid}>
                    {diferenciais.map((item, index) => (
                        <DiferencialCard
                            key={item.titulo}
                            numero={String(index + 1).padStart(2, "0")}
                            titulo={item.titulo}
                            texto={item.texto}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}