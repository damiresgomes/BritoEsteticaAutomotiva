import { useParams } from "react-router-dom";
import FormularioCliente from "./FormularioCliente";

export default function EditarCliente() {
  const { id } = useParams();
  const clienteId = Number(id);

  if (!Number.isInteger(clienteId) || clienteId < 1) {
    return <p>Cliente não encontrado.</p>;
  }

  return <FormularioCliente id={clienteId} />;
}
