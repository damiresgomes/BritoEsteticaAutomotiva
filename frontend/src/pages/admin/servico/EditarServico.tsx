import { useParams } from "react-router-dom";
import FormularioServico from "./FormularioServico";

export default function EditarServico () {
  const { id } = useParams();
  return <FormularioServico id={Number(id)} />;
}