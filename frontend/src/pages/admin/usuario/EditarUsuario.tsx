import { Link, useParams } from "react-router-dom";
import FormularioUsuario from "./FormularioUsuario";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function EditarUsuario() {
  const { id } = useParams();
  const usuarioId = Number(id);

  if (!Number.isInteger(usuarioId) || usuarioId < 1) {
    return (
      <section className={styles.pagina}>
        <p>Usuário não encontrado.</p>
        <Link to="/admin/usuario">Voltar para listagem</Link>
      </section>
    );
  }

  return <FormularioUsuario id={usuarioId} />;
}