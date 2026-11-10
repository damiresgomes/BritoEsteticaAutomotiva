import styles from "./styles.module.css";
import Historia from "./components/Historia";
import Estatisticas from "./components/Estatisticas";
import Valores from "./components/Valores";
import Chamada from "../../../components/Chamada";
import Botao from "../../../components/Botao";

export default function SobreSite() {
  return (
    <div className={styles.sobre}>
      <Historia />
      <Estatisticas />
      <Valores />
      <Chamada
        titulo="VENHA SENTIR A DIFERENÇA"
        descricao="Reserve seu horário e descubra por que somos a escolha de quem entende de carro."
      >
        <Botao to="/agendamento">AGENDAR AGORA</Botao>
      </Chamada>
    </div>
  );
}