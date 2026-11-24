import axios from "axios";

type ErroValidacao = {
  campo: string;
  mensagem: string;
};

// Exporta a função/componente 'obterMensagemErro' para uso em rotas ou outros componentes.
export function obterMensagemErro(erro: unknown): string {
  // Condição: axios.isAxiosError(erro).
  if (axios.isAxiosError(erro)) {
    // Condição: !erro.response.
    if (!erro.response) {
      // Retorna "Não foi possível conectar ao servidor. Tente novamente.".
      return "Não foi possível conectar ao servidor. Tente novamente.";
    }

    // Declara constante 'dados'.
    const dados = erro.response.data;

    // Condição: Array.isArray(dados?.erros) && dados.erros.length > 0.
    if (Array.isArray(dados?.erros) && dados.erros.length > 0) {
      return (dados.erros as ErroValidacao[])
        // Chamada: .map((item) => item.mensagem).
        .map((item) => item.mensagem)
        // Chamada: .join("; ");.
        .join("; ");
    }

    if (typeof dados?.message === "string") return dados.message;

    // Condição: erro.response.status === 401.
    if (erro.response.status === 401) {
      // Retorna "Você precisa estar autenticado para realizar esta ação.".
      return "Você precisa estar autenticado para realizar esta ação.";
    }
  }

  // Retorna "Ocorreu um erro inesperado. Tente novamente.".
  return "Ocorreu um erro inesperado. Tente novamente.";
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Normaliza erros de API/rede para mensagens amigáveis na UI.
