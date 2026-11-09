import styles from "./styles.module.css";

type CardAdminProps = {
  titulo: string;
  valor: string | number;
  descricao: string;
};

export default function CardAdmin({ titulo, valor, descricao }: CardAdminProps) {
  return (
    <article className={styles.card}>
      <span className={styles.titulo}>{titulo}</span>
      <strong className={styles.valor}>{valor}</strong>
      <span className={styles.descricao}>{descricao}</span>
    </article>
  );
}
