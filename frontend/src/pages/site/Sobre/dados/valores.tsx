import type { ReactNode } from "react";

export interface Valor {
    titulo: string;
    texto: string;
    icone: ReactNode;
}

function Icone ({ children }: {children: ReactNode}) {
    return(
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const valores: Valor[] = [
    {
    titulo: "EXCELÊNCIA SEM ATALHOS",
    texto: "Métodos profissionais, produtos premium e zero tolerância a entregas medianas.",
    icone: (
      <Icone>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </Icone>
    ),
  },
  {
    titulo: "DOMÍNIO TÉCNICO",
    texto: "Equipe treinada em técnicas de detailing reconhecidas internacionalmente.",
    icone: (
      <Icone>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </Icone>
    ),
  },
  {
    titulo: "CUIDADO VERDADEIRO",
    texto: "Tratamos cada veículo com a mesma atenção que daríamos ao nosso próprio.",
    icone: (
      <Icone>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </Icone>
    ),
  },
  {
    titulo: "CONFIANÇA DO CLIENTE",
    texto: "Transparência total, comunicação clara e garantia em todos os serviços.",
    icone: (
      <Icone>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icone>
    ),
  },
];