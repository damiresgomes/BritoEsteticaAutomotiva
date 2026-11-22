import { Navigate, useParams } from "react-router-dom";
import FormularioCategoria from "./FormularioCategoria";

export default function EditarCategoria() {
  const { id } = useParams();
  const categoriaId = Number(id);

  if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
    return <Navigate to="/admin/categoria" replace />;
  }

  return <FormularioCategoria id={categoriaId} />;
}