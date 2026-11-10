import { useParams } from "react-router-dom";
import FormularioAgendamento from "./FormularioAgendamento";

export default function EditarAgendamento() {
  const { id } = useParams();
  const clienteId = Number(id);
  if (!Number.isInteger(clienteId) || clienteId < 1) {
    return <p>Agendamento não encontrado.</p>;
  }
  return <FormularioAgendamento id={clienteId} />;
}