import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService, type ClienteAdmin } from "../../../services/clients";
import { agendamentoService, type StatusAgendamento } from "../../../services/agendamentos";
import { servicoService, type Servico } from "../../../services/services";
import { obterMensagemErro } from "../../../utils/erros";
import { dataLocalAtual } from "../../../utils/datas";

type Props = { id?: number };

type Formulario = {
  clienteId: string;
  placa: string;
  veiculo: string;
  servicoId: string;
  extras: number[];
  data: string;
  horario: string;
  observacoes: string;
  status: StatusAgendamento;
};

const FORMULARIO_VAZIO: Formulario = {
  clienteId: "",
  placa: "",
  veiculo: "",
  servicoId: "",
  extras: [],
  data: "",
  horario: "",
  observacoes: "",
  status: "Pendente",
};

export default function FormularioAgendamento({ id }: Props) {
  const [form, setForm] = useState<Formulario>(FORMULARIO_VAZIO);
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [extras, setExtras] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      try {
        const [listaClientes, servicosPrincipais, servicosExtras, agendamentos] =
          await Promise.all([
            clienteService.listar(),
            servicoService.listarPorCategoria(1),
            servicoService.listarPorCategoria(2),
            id === undefined ? Promise.resolve([]) : agendamentoService.listarAdmin(),
          ]);

        if (cancelado) return;
        setClientes(listaClientes);
        setServicos(servicosPrincipais);
        setExtras(servicosExtras);

        if (id !== undefined) {
          const agendamento = agendamentos.find((item) => item.id === id);
          if (!agendamento) {
            setErro("Agendamento não encontrado.");
            setFalhaCarregamento(true);
            return;
          }
          setForm({
            clienteId: String(agendamento.clienteId),
            placa: agendamento.placa,
            veiculo: agendamento.veiculo,
            servicoId: String(agendamento.servicoId),
            extras: agendamento.extras,
            data: agendamento.data,
            horario: agendamento.horario,
            observacoes: agendamento.observacoes ?? "",
            status: agendamento.status,
          });
        }
      } catch (erroApi) {
        if (!cancelado) {
          setErro(obterMensagemErro(erroApi));
          setFalhaCarregamento(true);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregarDados();
    return () => {
      cancelado = true;
    };
  }, [id]);

  function atualizarCampo(campo: keyof Formulario, valor: string | number[]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarExtra(idExtra: number) {
    setForm((atual) => ({
      ...atual,
      extras: atual.extras.includes(idExtra)
        ? atual.extras.filter((item) => item !== idExtra)
        : [...atual.extras, idExtra],
    }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);

    const dados = {
      clienteId: Number(form.clienteId),
      placa: form.placa,
      veiculo: form.veiculo,
      servicoId: Number(form.servicoId),
      extras: form.extras,
      data: form.data,
      horario: form.horario,
      observacoes: form.observacoes,
    };

    try {
      if (id === undefined) {
        await agendamentoService.criarAdmin(dados);
      } else {
        await agendamentoService.atualizarAdmin(id, { ...dados, status: form.status });
      }
      navigate("/admin/agendamento");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <section className={styles.pagina}><p>Carregando formulário...</p></section>;
  }

  if (falhaCarregamento) {
    return (
      <section className={styles.pagina}>
        <HeaderAdmin
          titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}
          links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}
        />
        <p className={styles.mensagem} role="alert">{erro}</p>
      </section>
    );
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo={id === undefined ? "CADASTRAR AGENDAMENTO" : "EDITAR AGENDAMENTO"}
        links={[{ to: "/admin/agendamento", label: "← VOLTAR AOS AGENDAMENTOS" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Cliente
          <select
            required
            value={form.clienteId}
            onChange={(evento) => atualizarCampo("clienteId", evento.target.value)}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}{cliente.status === "Inativo" ? " (inativo)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.campo}>
          Placa
          <input
            required
            maxLength={8}
            placeholder="ABC1D23"
            value={form.placa}
            onChange={(evento) => atualizarCampo("placa", evento.target.value.toUpperCase())}
          />
        </label>

        <label className={styles.campo}>
          Veículo
          <input
            required
            maxLength={50}
            placeholder="Modelo do veículo"
            value={form.veiculo}
            onChange={(evento) => atualizarCampo("veiculo", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Serviço principal
          <select
            required
            value={form.servicoId}
            onChange={(evento) => atualizarCampo("servicoId", evento.target.value)}
          >
            <option value="">Selecione um serviço</option>
            {servicos.map((servico) => (
              <option key={servico.id_servico} value={servico.id_servico}>
                {servico.nome_servico}
              </option>
            ))}
          </select>
        </label>

        {extras.length > 0 && (
          <fieldset className={styles.campo}>
            <legend>Serviços adicionais</legend>
            {extras.map((extra) => (
              <label key={extra.id_servico}>
                <input
                  type="checkbox"
                  checked={form.extras.includes(extra.id_servico)}
                  onChange={() => alternarExtra(extra.id_servico)}
                />
                {extra.nome_servico}
              </label>
            ))}
          </fieldset>
        )}

        <label className={styles.campo}>
          Data
          <input
            required
            type="date"
            min={dataLocalAtual()}
            value={form.data}
            onChange={(evento) => atualizarCampo("data", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Horário
          <input
            required
            type="time"
            value={form.horario}
            onChange={(evento) => atualizarCampo("horario", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          Observações
          <textarea
            maxLength={500}
            placeholder="Observações pertinentes ao atendimento..."
            value={form.observacoes}
            onChange={(evento) => atualizarCampo("observacoes", evento.target.value)}
          />
        </label>

        {id !== undefined && (
          <label className={styles.campo}>
            Status
            <select
              value={form.status}
              onChange={(evento) => atualizarCampo("status", evento.target.value as StatusAgendamento)}
              disabled={form.status === "Cancelado"}
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            {form.status === "Cancelado" && (
              <small>Agendamentos cancelados não podem ser reativados.</small>
            )}
          </label>
        )}

        {erro && <p className={styles.menssagem} role="alert">{erro}</p>}
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : id === undefined ? "Cadastrar agendamento" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}