// Exporta a constante 'WHATSAPP_URL'.
export const WHATSAPP_URL = "https://wa.me/5519981339017";
// Exporta a constante 'TELEFONE_CONTATO'.
export const TELEFONE_CONTATO = "(19) 98133-9017";
// Exporta a constante 'TELEFONE_CONTATO_LINK'.
export const TELEFONE_CONTATO_LINK = "19981339017";

// Exporta a função/componente 'urlWhatsapp' para uso em rotas ou outros componentes.
export function urlWhatsapp(mensagem: string): string {
  // Retorna `${WHATSAPP_URL}?text=${encodeURIComponent(mensagem)}`.
  return `${WHATSAPP_URL}?text=${encodeURIComponent(mensagem)}`;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Utilitários de telefone/contato.
