import Botao from "../../../../components/Botao";

import styles from "../styles.module.css"

export default function Hero () {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <span className={styles.subtitulo}>ESTÉTICA AUTOMOTIVA BRITO</span>
                <h1 className={styles.tituloPrincipal}>O REFLEXO DA
                    <br />
                    <span className={styles.spanPrincipal}>EXCELÊNCIA.</span>
                </h1>

                <p className={styles.descricao}>
                Cuidado meticuloso para veículos que exigem o máximo. Do brilho
                profundo à proteção duradoura — agende seu horário em minutos.
                </p>

                <div className={styles.grupoBotoes}>
                    <Botao to="/agendamento">RESERVAR HORÁRIO</Botao>
                    <Botao to="/servico" variante="secundario">VER SERVIÇOS</Botao>
                </div>
            </div>
        </section>
    );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Home/components/Hero.tsx) responsável por renderizar UI e orquestrar interações do usuário.
