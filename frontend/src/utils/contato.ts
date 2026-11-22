export const WHATSAPP_URL = "https://wa.me/5519981339017";
export const TELEFONE_CONTATO = "(19) 98133-9017";
export const TELEFONE_CONTATO_LINK = "19981339017";

export function urlWhatsapp(mensagem: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(mensagem)}`;
}
