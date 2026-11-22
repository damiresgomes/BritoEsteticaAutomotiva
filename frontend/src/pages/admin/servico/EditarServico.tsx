import { Navigate, useParams } from "react-router-dom";
import FormularioServico from "./FormularioServico";

export default function EditarServico() {
  const { id } = useParams();
  const servicoId = Number(id);

  if (!Number.isInteger(servicoId) || servicoId <= 0) {
    return <Navigate to="/admin/servico" replace />;
  }

  return <FormularioServico id={servicoId} />;
}