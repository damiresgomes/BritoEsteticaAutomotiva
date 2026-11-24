import { Link, useParams } from "react-router-dom";
import FormularioUsuario from "./FormularioUsuario";
import styles from "../../../components/AdminCrud/styles.module.css";

export default function EditarUsuario() {
  const { id } = useParams();
  // Declara constante 'usuarioId'.
  const usuarioId = Number(id);

  // Condição: !Number.isInteger(usuarioId) || usuarioId < 1.
  if (!Number.isInteger(usuarioId) || usuarioId < 1) {
    return (
      <section className={styles.pagina}>
        <p>Usuário não encontrado.</p>
        <Link to="/admin/usuario">Voltar para listagem</Link>
      </section>
    );
  }

  // Retorna <FormularioUsuario id={usuarioId} />.
  return <FormularioUsuario id={usuarioId} />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Usuario/EditarUsuario.tsx) responsável por renderizar UI e orquestrar interações do usuário.
