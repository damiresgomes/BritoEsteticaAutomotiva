import axios from "axios";

type ErroValidacao = {
  campo: string;
  mensagem: string;
};

export function obterMensagemErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    if (!erro.response) {
      return "Não foi possível conectar ao servidor. Tente novamente.";
    }

    const dados = erro.response.data;

    if (Array.isArray(dados?.erros) && dados.erros.length > 0) {
      return (dados.erros as ErroValidacao[])
        .map((item) => item.mensagem)
        .join("; ");
    }

    if (typeof dados?.message === "string") return dados.message;

    if (erro.response.status === 401) {
      return "Você precisa estar autenticado para realizar esta ação.";
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
