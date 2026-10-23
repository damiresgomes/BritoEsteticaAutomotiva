import styles from './styles.module.css'

export default function SobreSite () {
    return (
        <div className={styles.sobre}>
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.contentCol}>
                        <span className={styles.tagSobre}>[ NOSSA HISTÓRIA ]</span>

                        <h1 className={styles.titulo}>
                            PAIXÃO POR<br />
                            CARROS.<br />
                            <span className={styles.azul}>OBSESSÃO POR<br />DETALHES.</span>
                        </h1>

                        <div className={styles.descricao}>
                            <p>
                                A Brito Estética Automotiva nasceu em 2014, em uma garagem
                                pequena, com uma única ambição: tratar cada veículo como se
                                fosse o nosso. Doze anos depois, somos referência em estética
                                automotiva premium na região.
                            </p>
                            <p>
                                Combinamos técnica refinada, produtos de alta performance e um
                                compromisso inegociável com a sua satisfação. Aqui, lavar o carro é arte.
                            </p>
                        </div>
                    </div>

                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <img 
                                src='/sobreCarro.jpg'
                                alt="Carro esportivo preto na garagem de estética automotiva" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>2014</span>
                        <span className={styles.statLabel}>FUNDADA EM</span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statValue}>+8.500</span>
                        <span className={styles.statLabel}>VEÍCULOS DETALHADOS</span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statValue}>+12</span>
                        <span className={styles.statLabel}>PROFISSIONAIS FORMADOS</span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statValue}>4.9★</span>
                        <span className={styles.statLabel}>AVALIAÇÃO GOOGLE</span>
                    </div>
                </div>
            </section>

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
                            <div className={styles.valorItem}>
                                <div className={styles.iconBox}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="#5cb3ff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path
                                            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>

                                <div className={styles.valorInfo}>
                                    <h3>EXCELÊNCIA SEM ATALHOS</h3>
                                    <p>Métodos profissionais, produtos premium e zero tolerância a entregas medianas.</p>
                                </div>
                            </div>

                            <div className={styles.valorItem}>
                                <div className={styles.iconBox}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="#5cb3ff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path
                                            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                    </svg>
                                </div>
                                <div className={styles.valorInfo}>
                                    <h3>DOMÍNIO TÉCNICO</h3>
                                    <p>Equipe treinada em técnicas de detailing reconhecidas internacionalmente.</p>
                                </div>
                            </div>

                            <div className={styles.valorItem}>
                                <div className={styles.iconBox}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="#5cb3ff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path
                                            d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                    </svg>
                                </div>
                                <div className={styles.valorInfo}>
                                    <h3>CUIDADO VERDADEIRO</h3>
                                    <p>Tratamos cada veículo com a mesma atenção que daríamos ao nosso próprio.</p>
                                </div>
                            </div>

                            <div className={styles.valorItem}>
                                <div className={styles.iconBox}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="#5cb3ff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div className={styles.valorInfo}>
                                    <h3>CONFIANÇA DO CLIENTE</h3>
                                    <p>Transparência total, comunicação clara e garantia em todos os serviços.</p>
                                </div>
                            </div>
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

            <section className={styles.chamada}>
                <div className={styles.containerChamada}>
                    <h1 className={styles.tituloChamada}>
                        VENHA SENTIR A DIFERENÇA
                    </h1>
                    <p className={styles.descricaoChamada}>
                        Reserve seu horário e descubra por que somos a escolha de quem entende de carro.
                    </p>
                    <a href="agendamento" className={styles.botaoChamada}>AGENDAR AGORA</a>
                </div>
            </section>
        </div>
    );
}