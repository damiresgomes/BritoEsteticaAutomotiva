import styles from "./styles.module.css"

export default function HomeSite () {
    return (
        <div className="home">
            <section className="hero" style={{backgroundImage: `url("/hero-car.jpg")`}}>
                <div className={styles.container}>
                    <div>
                        <div>
                            <span className={styles.subtitulo}>ESTÉTICA AUTOMOTIVA BRITO</span>
                            <h1 className={styles.tituloPrincipal}>O REFLEXO DA <br /> <span className={styles.spanPrincipal}>EXCELÊNCIA.</span></h1>
                            <p className={styles.descricao}>
                            Cuidado meticuloso para veículos que exigem o máximo. Do brilho
                            profundo à proteção duradoura — agende seu horário em minutos.
                            </p>

                            <div className={styles.grupoBotoes}>
                                <a href="#" className={styles.btn1}>RESERVAR HORÁRIO</a>
                                <a href="#" className={styles.btn2}>VER SERVIÇOS</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.diferenciais}>
                <div className={styles.container}>
                    <div>
                        <div>
                            <h2 className={styles.titulo}>POR QUE ESCOLHER A<br />
                                <span className={styles.span}>BRITO ESTÉTICA AUTOMOTIVA?</span>
                            </h2>
                        </div>

                        <div>
                            <p className={styles.descricao}>
                            Quatro pilares que sustentam cada serviço entregue na Brito
                            Estética — do primeiro enxágue ao último detalhe.
                            </p>
                        </div>
                    </div>

                    <div className={styles.cardsGrid}>
                        <div className={styles.cardItem}>
                            <div className={styles.cardHeaderCustom}>
                                <span className={styles.cardNumero}>01</span>
                            </div>

                            <h3 className={styles.cardTitle}>LAVAGEM TÉCNICA</h3>
                            <p className={styles.cardText}>
                            Métodos profissionais de duas baldes e luva de microfibra que
                            protegem a pintura contra micro-riscos.
                            </p>
                        </div>

                        <div className={styles.cardItem}>
                            <div className={styles.cardHeaderCustom}>
                                <span className={styles.cardNumero}>02</span>
                            </div>

                            <h3 className={styles.cardTitle}>PRODUTOS PREMIUM</h3>
                            <p className={styles.cardText}>
                            Insumos Vonixx, Soft99 e cera de carnaúba de alta performance —
                            brilho profundo e duradouro.
                            </p>
                        </div>

                        <div className={styles.cardItem}>
                            <div className={styles.cardHeaderCustom}>
                                <span className={styles.cardNumero}>03</span>
                            </div>

                            <h3 className={styles.cardTitle}>RAPIDEZ GARANTIDA</h3>
                            <p className={styles.cardText}>
                            Seu carro pronto no horário combinado. Sem atrasos, sem surpresas
                            — você acompanha tudo pelo WhatsApp.
                            </p>
                        </div>

                        <div className={styles.cardItem}>
                            <div className={styles.cardHeaderCustom}>
                                <span className={styles.cardNumero}>04</span>
                            </div>

                            <h3 className={styles.cardTitle}>SATISFAÇÃO TOTAL</h3>
                            <p className={styles.cardText}>
                            Não gostou de algum detalhe? Refazemos o serviço sem custo
                            adicional. Compromisso assinado.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.chamadaAgendamento}>
                <div className={styles.container}>
                    <h2 className={styles.tituloChamada}>PRONTO PARA O BRILHO?<br />
                        <span className={styles.span}>AGENDE EM 60 SEGUNDOS.</span>
                    </h2>
                    
                    <p className={styles.descricaoChamada}>
                    Escolha o horário, receba a confirmação na hora e tire dúvidas direto
                    no WhatsApp.
                    </p>

                    <div>
                        <a href="#" className={styles.botaoPrincipal}>
                            AGENDAR AGORA
                        </a>
                        <a href="https://wa.me/5519981339017" target="_blank" className={styles.botaoSecundario}>
                            FALAR NO WHATSAPP
                        </a>
                    </div>

                    <div className={styles.rodapeInformacao}>
                        <span>
                            <span className={styles.pontoAzul}>•</span> RESPOSTA EM MINUTOS
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}