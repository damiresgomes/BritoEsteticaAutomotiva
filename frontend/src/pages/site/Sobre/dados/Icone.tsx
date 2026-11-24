import type { ReactNode } from "react";

export default function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      // Atribuição: width="20".
      width="20"
      // Atribuição: height="20".
      height="20"
      // Atribuição: viewBox="0 0 24 24".
      viewBox="0 0 24 24"
      // Atribuição: fill="none".
      fill="none"
      // Atribuição: stroke="currentColor".
      stroke="currentColor"
      // Atribuição: strokeWidth="2".
      strokeWidth="2"
      // Atribuição: strokeLinecap="round".
      strokeLinecap="round"
      // Atribuição: strokeLinejoin="round".
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Página/componente de tela React (frontend/src/pages/site/Sobre/dados/Icone.tsx) responsável por renderizar UI e orquestrar interações do usuário.
