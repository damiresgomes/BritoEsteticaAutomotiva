import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../../../components/HeaderAdmin";
import styles from "../../../components/AdminCrud/styles.module.css";
import { clienteService } from "../../../services/clients";
import { mascararCPF } from "../../../utils/cpf";
import { obterMensagemErro } from "../../../utils/erros";

type Props = { id?: number };

export default function FormularioCliente({ id }: Props) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
  });
  const [temConta, setTemConta] = useState(id === undefined);
  const [carregando, setCarregando] = useState(id !== undefined);
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id === undefined) return;
    clienteService.buscarPorId(id)
      .then((cliente) => {
        setForm({
          nome: cliente.nome,
          cpf: cliente.cpf ?? "",
          email: cliente.email ?? "",
          telefone: cliente.telefone ?? "",
          senha: "",
        });
        setTemConta(cliente.status !== "Sem conta");
      })
      .catch((erroApi: unknown) => {
        setErro(obterMensagemErro(erroApi));
        setFalhaCarregamento(true);
      })
      .finally(() => setCarregando(false));
  }, [id]);

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    const dados = {
      nome: form.nome.trim(),
      cpf: form.cpf,
      email: form.email.trim(),
      telefone: form.telefone,
      ...(form.senha ? { senha: form.senha } : {}),
    };

    try {
      if (id === undefined) await clienteService.criar(dados);
      else await clienteService.atualizar(id, dados);
      navigate("/admin/cliente");
    } catch (erroApi) {
      setErro(obterMensagemErro(erroApi));
    }
  }

  if (carregando) {
    return <section className={styles.pagina}><p>Carregando cliente...</p></section>;
  }

  if (falhaCarregamento) {
    return (
      <section className={styles.pagina}>
        <HeaderAdmin
          titulo="EDITAR CLIENTE"
          links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}
        />
        <p className={styles.menssagem} role="alert">{erro}</p>
      </section>
    );
  }

  return (
    <section className={styles.pagina}>
      <HeaderAdmin
        titulo={id === undefined ? "CADASTRAR CLIENTE" : "EDITAR CLIENTE"}
        links={[{ to: "/admin/cliente", label: "← VOLTAR AOS CLIENTES" }]}
      />
      <form className={styles.formulario} onSubmit={salvar}>
        <label className={styles.campo}>
          Nome
          <input
            required
            maxLength={100}
            value={form.nome}
            onChange={(evento) => atualizarCampo("nome", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          CPF
          <input
            required
            inputMode="numeric"
            autoComplete="tax-id"
            maxLength={14}
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(evento) => atualizarCampo("cpf", mascararCPF(evento.target.value))}
          />
        </label>
        <label className={styles.campo}>
          E-mail de acesso
          <input
            required
            type="email"
            maxLength={100}
            value={form.email}
            onChange={(evento) => atualizarCampo("email", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          Telefone
          <input
            required
            type="tel"
            maxLength={20}
            value={form.telefone}
            onChange={(evento) => atualizarCampo("telefone", evento.target.value)}
          />
        </label>
        <label className={styles.campo}>
          {id === undefined || !temConta ? "Senha inicial" : "Nova senha (opcional)"}
          <input
            required={id === undefined || !temConta}
            type="password"
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={form.senha}
            onChange={(evento) => atualizarCampo("senha", evento.target.value)}
          />
          <small>
            Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
          </small>
        </label>
        {id !== undefined && !temConta && (
          <p>Este cliente ainda não tem conta. Informe email e senha para criar o acesso.</p>
        )}
        {id !== undefined && temConta && (
          <p>Deixe a senha vazia para manter a senha atual.</p>
        )}
        {erro && <p className={styles.message} role="alert">{erro}</p>}
        <button type="submit">{id === undefined ? "Cadastrar cliente" : "Salvar alterações"}</button>
      </form>
    </section>
  );
}
