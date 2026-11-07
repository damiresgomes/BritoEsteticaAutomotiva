import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../../../servicos/autenticacao";

import styles from "./styles.module.css";

type Opcao = { id: string; nome: string; preco: number };

const LISTA_DE_SERVICOS: Opcao[] = [
  { id: "lavagem-detalhada", nome: "Lavagem Detalhada", preco: 70 },
  { id: "lavagem-simples", nome: "Lavagem Simples", preco: 40 },
  { id: "lavagem-completa", nome: "Lavagem Completa", preco: 110 },
];

const LISTA_DE_ACRESCIMOS: Opcao[] = [
  { id: "cera", nome: "Cera Líquida Vonixx", preco: 35 },
  { id: "bancos", nome: "Higienização de Bancos", preco: 60 },
  { id: "farois", nome: "Polimento de Faróis", preco: 80 },
  { id: "cristalizacao", nome: "Cristalização da Pintura", preco: 120 },
  { id: "couro", nome: "Hidratação de Couro", preco: 70 },
  { id: "aroma", nome: "Aromatização Premium", preco: 20 },
];

const LISTA_DE_HORARIOS = [
  "08:00", "09:00", "10:00", "11:00", "13:00",
  "14:00", "15:00", "16:00", "17:00",
];

const formatarPreco = (valor: number) => `R$ ${valor}`;

export default function BookingForm() {
  const location = useLocation();
  const autenticado = authService.isAuthenticated();
  const [mostrarAviso, setMostrarAviso] = useState(() => !autenticado);
  const [dadosDoFormulario, setDadosDoFormulario] = useState({
    nome: "",
    whatsapp: "",
    veiculo: "",
    servico: LISTA_DE_SERVICOS[0].id,
    data: "",
    horario: "",
    observacoes: "",
  });

  const [acrescimosMarcados, setAcrescimosMarcados] = useState<string[]>([]);

  const aoMudarCampo = (
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setDadosDoFormulario({
      ...dadosDoFormulario,
      [evento.target.name]: evento.target.value,
    });
  };

  const marcarOuDesmarcarAcrescimo = (idDoAcrescimo: string) => {
    if (acrescimosMarcados.includes(idDoAcrescimo)) {
      setAcrescimosMarcados(
        acrescimosMarcados.filter((id) => id !== idDoAcrescimo)
      );
    } else {
      setAcrescimosMarcados([...acrescimosMarcados, idDoAcrescimo]);
    }
  };

  const servicoEscolhido = LISTA_DE_SERVICOS.find(
    (servico) => servico.id === dadosDoFormulario.servico
  );
  const precoDoServico = servicoEscolhido ? servicoEscolhido.preco : 0;

  const precoDosAcrescimos = LISTA_DE_ACRESCIMOS
    .filter((acrescimo) => acrescimosMarcados.includes(acrescimo.id))
    .reduce((soma, acrescimo) => soma + acrescimo.preco, 0);

  const valorTotal = precoDoServico + precoDosAcrescimos;

  const aoEnviarFormulario = (evento: FormEvent) => {
    evento.preventDefault();

    if (!authService.isAuthenticated()) {
      setMostrarAviso(true);
      return;
    }

    console.log({ ...dadosDoFormulario, acrescimosMarcados, valorTotal });
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Agende seu <span>horário</span></h1>
        <p className={styles.subtitulo}>
          Escolha os serviços e encontre o melhor horário para cuidar do seu veículo.
        </p>
      </header>

      <form
        className={styles.cartao}
        onSubmit={aoEnviarFormulario}
        inert={!autenticado && mostrarAviso}
        aria-hidden={!autenticado && mostrarAviso}
      >
        <div className={styles.linha}>
          <label className={styles.campo}>
            <span className={styles.rotulo}>Nome completo</span>
            <input
              className={styles.entrada}
              type="text"
              name="nome"
              placeholder="Roberto Silva"
              value={dadosDoFormulario.nome}
              onChange={aoMudarCampo}
              required
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.rotulo}>WhatsApp</span>
            <input
              className={styles.entrada}
              type="tel"
              name="whatsapp"
              placeholder="(11) 99999-9999"
              value={dadosDoFormulario.whatsapp}
              onChange={aoMudarCampo}
              required
            />
          </label>
        </div>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Veículo</span>
          <input
            className={styles.entrada}
            type="text"
            name="veiculo"
            placeholder="Honda Civic — Preto"
            value={dadosDoFormulario.veiculo}
            onChange={aoMudarCampo}
            required
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Serviço</span>
          <select
            className={`${styles.entrada} ${styles.listaSuspensa}`}
            name="servico"
            value={dadosDoFormulario.servico}
            onChange={aoMudarCampo}
          >
            {LISTA_DE_SERVICOS.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome} — {formatarPreco(servico.preco)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className={`${styles.campo} ${styles.grupo}`}>
          <legend className={styles.rotulo}>Acréscimos opcionais</legend>

          <div className={styles.gradeDeAcrescimos}>
            {LISTA_DE_ACRESCIMOS.map((acrescimo) => {
              const estaMarcado = acrescimosMarcados.includes(acrescimo.id);

              return (
                <button
                  key={acrescimo.id}
                  type="button"
                  className={`${styles.botaoAcrescimo} ${estaMarcado ? styles.marcado : ""}`}
                  aria-pressed={estaMarcado}
                  onClick={() => marcarOuDesmarcarAcrescimo(acrescimo.id)}
                >
                  <span>{acrescimo.nome}</span>
                  <span className={styles.precoDoAcrescimo}>
                    +{formatarPreco(acrescimo.preco)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.linha}>
          <label className={styles.campo}>
            <span className={styles.rotulo}>Data</span>
            <input
              className={styles.entrada}
              type="date"
              name="data"
              value={dadosDoFormulario.data}
              onChange={aoMudarCampo}
              required
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.rotulo}>Horário</span>
            <select
              className={`${styles.entrada} ${styles.listaSuspensa}`}
              name="horario"
              value={dadosDoFormulario.horario}
              onChange={aoMudarCampo}
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              {LISTA_DE_HORARIOS.map((horario) => (
                <option key={horario} value={horario}>
                  {horario}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.campo}>
          <span className={styles.rotulo}>Observações (opcional)</span>
          <textarea
            className={`${styles.entrada} ${styles.areaDeTexto}`}
            name="observacoes"
            rows={3}
            placeholder="Algum detalhe sobre o veículo ou serviço..."
            value={dadosDoFormulario.observacoes}
            onChange={aoMudarCampo}
          />
        </label>

        <div className={styles.rodape}>
          <div className={styles.total}>
            <span className={styles.rotulo}>Total</span>
            <strong>{formatarPreco(valorTotal)}</strong>
          </div>

          <button className={styles.botaoEnviar} type="submit">
            Agendar horário
          </button>
        </div>
      </form>

      {!autenticado && mostrarAviso && (
        <div className={styles.sobreposicao}>
          <section
            className={styles.alerta}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="aviso-login-titulo"
            aria-describedby="aviso-login-descricao"
          >
            <button
              className={styles.fecharAviso}
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setMostrarAviso(false)}
            >
              ×
            </button>
            <span className={styles.alertaEtiqueta}>SUA CONTA NA BRITO ESTÉTICA</span>
            <h2 id="aviso-login-titulo">Entre para agendar</h2>
            <p id="aviso-login-descricao">
              Para realizar um agendamento, entre na sua conta ou faça seu cadastro gratuito.
            </p>
            <div className={styles.acoesAviso}>
              <Link
                className={styles.botaoCadastro}
                to="/autenticacao/cadastro"
                state={{ from: location }}
              >
                Criar cadastro
              </Link>
              <Link
                className={styles.linkLogin}
                to="/autenticacao/login"
                state={{ from: location }}
              >
                Já tenho cadastro — Entrar
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}