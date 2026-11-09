import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService, type PerfilConta } from "../../services/auth";
import { obterMensagemErro } from "../../utils/erros";
import styles from "./MinhaConta.module.css";

export default function MinhaConta() {
  const [perfil, setPerfil] = useState<PerfilConta | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authService.buscarPerfil()
      .then((dados) => {
        if (dados.papel !== "cliente") {
          setErro("Esta área é exclusiva para clientes.");
          return;
        }
        setPerfil(dados);
      })
      .catch((erroApi: unknown) => setErro(obterMensagemErro(erroApi)))
      .finally(() => setCarregando(false));
  }, []);

  function sair() {
    authService.logout("cliente");
    navigate("/autenticacao/login", { replace: true });
  }

  if (carregando) return <main className={styles.page}><p>Carregando sua conta...</p></main>;
  if (erro || !perfil) {
    return <main className={styles.page}><p role="alert">{erro || "Conta indisponível."}</p></main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>// ÁREA DO CLIENTE</p>
        <h1>Olá, {perfil.nome}</h1>
        <p>Você entrou na sua conta.</p>
        <dl className={styles.details}>
          <div><dt>E-mail</dt><dd>{perfil.email}</dd></div>
          {perfil.cpf && <div><dt>CPF</dt><dd>{perfil.cpf}</dd></div>}
        </dl>
        <div className={styles.actions}>
          <Link to="/agendamento">Agendar um serviço</Link>
          <button type="button" onClick={sair}>Sair</button>
        </div>
      </section>
    </main>
  );
}
