import styles from '../styles.module.css';

export default function Historia() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.contentCol}>
          <span className={styles.tagSobre}>[ NOSSA HISTÓRIA ]</span>

          <h1 className={styles.titulo}>
            PAIXÃO POR<br />
            CARROS.<br />
            <span className={styles.azul}>
              OBSESSÃO POR<br />
              DETALHES.
            </span>
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
              compromisso inegociável com a sua satisfação. Aqui, cuidar do seu carro é arte.
            </p>
          </div>
        </div>

        <div className={styles.imageCol}>
          <div className={styles.imageWrapper}>
            <img 
              src="/sobreCarro.jpg" 
              alt="Carro esportivo preto na garagem de estética automotiva"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}