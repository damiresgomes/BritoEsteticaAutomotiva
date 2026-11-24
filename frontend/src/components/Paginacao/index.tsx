import styles from "./styles.module.css";

type PaginacaoProps = {
  pagina: number;
  totalPaginas: number;
  aoMudarPagina: (pagina: number) => void;
};

export default function Paginacao({ pagina, totalPaginas, aoMudarPagina }: PaginacaoProps) {

  if (totalPaginas <= 1) return null;

  return (
    <nav className={styles.paginacao} aria-label="Paginação">
      <button
        // Atribuição: type="button".
        type="button"
        // Atribuição: onClick={() => aoMudarPagina(pagina - 1)}.
        onClick={() => aoMudarPagina(pagina - 1)}
        // Atribuição: disabled={pagina === 1}.
        disabled={pagina === 1}
      >
        Anterior
      </button>

      <span>
        Página {pagina} de {totalPaginas}
      </span>
      
      <button
        // Atribuição: type="button".
        type="button"
        // Atribuição: onClick={() => aoMudarPagina(pagina + 1)}.
        onClick={() => aoMudarPagina(pagina + 1)}
        // Atribuição: disabled={pagina === totalPaginas}.
        disabled={pagina === totalPaginas}
      >
        Próxima
      </button>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Componente reutilizável de paginação para listas administrativas.
