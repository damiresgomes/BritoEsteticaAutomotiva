import { Navigate, useParams } from "react-router-dom";
import FormularioCategoria from "./FormularioCategoria";

export default function EditarCategoria() {
  const { id } = useParams();
  // Declara constante 'categoriaId'.
  const categoriaId = Number(id);

  // Condição: !Number.isInteger(categoriaId) || categoriaId <= 0.
  if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
    // Retorna <Navigate to="/admin/categoria" replace />.
    return <Navigate to="/admin/categoria" replace />;
  }

  // Retorna <FormularioCategoria id={categoriaId} />.
  return <FormularioCategoria id={categoriaId} />;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/admin/Categoria/EditarCategoria.tsx) responsável por renderizar UI e orquestrar interações do usuário.
