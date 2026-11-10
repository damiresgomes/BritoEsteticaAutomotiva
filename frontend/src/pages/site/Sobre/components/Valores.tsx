import styles from "../styles.module.css";
import { valores } from "../dados/valores";

export default function Valores () {
    return (
        <section className={styles.valoresSection}>
            <div className={styles.valoresContainer}>
                <div className={styles.valoresContent}>
                    <span className={styles.tag}>[ NOSSOS VALORES ]</span>

                    <h2 className={styles.tituloValores}>
                        PRINCÍPIOS QUE <br />
                        GUIAM <br />
                        CADA SERVIÇO.
                    </h2>

                    <div className={styles.valoresLista}>
                        {valores.map(({ titulo, texto, icone }) => (
                            <div key={titulo} className={styles.valorItem}>

                                <div className={styles.iconBox}>{icone}</div>

                                <div className={styles.valorInfo}>
                                    <h3>{titulo}</h3>
                                    <p>{texto}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.valoresImage}>
                    <div className={styles.imageWrapper}>
                        <img
                        src="/sobrePolindo.jpg"
                        alt="Polimento automotivo profissional com politriz"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}