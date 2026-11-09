import { useParams } from "react-router-dom";
import FormularioCategoria from "./FormularioCategoria";

export default function EditarCategoria () {
  const { id } = useParams();
  return <FormularioCategoria id={Number(id)} />;
}