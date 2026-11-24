import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AcessoProibidoError, NaoAutorizadoError } from "../errors/AppError";
import { buscarContaClientePorEmail } from "../repositories/clienteRepository";
import { buscarContaPorEmail } from "../repositories/contaAcessoRepository";
import { LoginInput } from "../schemas/authSchema";

// Cria a constante local 'HASH_FICTICIO'; usar const evita reatribuição acidental.
const HASH_FICTICIO = bcrypt.hashSync("senha-ficticia-cliente", 10);

// Declara a função local 'hashBcryptCompativel'(hash: string) para encapsular lógica reutilizável neste arquivo.
function hashBcryptCompativel(hash: string): string {
  // Retorna hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash para quem chamou esta função.
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

// Exporta a função assíncrona 'loginClienteAuthService'({ email, senha }: LoginInput); pode usar await e retorna Promise, ficando disponível para outros módulos.
export async function loginClienteAuthService({ email, senha }: LoginInput): Promise<{ token: string }> {
  // Cria a constante local 'conta'; usar const evita reatribuição acidental.
  const conta = await buscarContaPorEmail(email);

  // Condição: se 'conta' for verdadeira, o bloco abaixo é executado.
  if (conta) {
    // Cria a constante local 'senhaCorreta'; usar const evita reatribuição acidental.
    const senhaCorreta = await bcrypt.compare(senha, hashBcryptCompativel(conta.senhaHash));
    // Condição: se '!senhaCorreta || conta.papel !== "cliente"' for verdadeira, o bloco abaixo é executado.
    if (!senhaCorreta || conta.papel !== "cliente") {
      // Lança 'NaoAutorizadoError' com ("E-mail ou senha inválidos."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new NaoAutorizadoError("E-mail ou senha inválidos.");
    }
    // Condição: se 'conta.ativo !== "Sim"' for verdadeira, o bloco abaixo é executado.
    if (conta.ativo !== "Sim") {
      // Lança 'AcessoProibidoError' com ("Cliente inativo."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new AcessoProibidoError("Cliente inativo.");
    }
    // Condição: se '!conta.clienteId' for verdadeira, o bloco abaixo é executado.
    if (!conta.clienteId) {
      // Lança 'NaoAutorizadoError' com ("Cliente não encontrado."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
      throw new NaoAutorizadoError("Cliente não encontrado.");
    }

    // Cria a constante local 'token'; usar const evita reatribuição acidental.
    const token = jwt.sign(
      {
        // Define a propriedade/campo 'id' no objeto/estrutura.
        id: conta.clienteId,
        // Define a propriedade/campo 'email' no objeto/estrutura.
        email: conta.email,
        // Define a propriedade/campo 'tipo' no objeto/estrutura.
        tipo: "cliente",
        // Define a propriedade/campo 'jti' no objeto/estrutura.
        jti: randomUUID(),
      },
      env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    // Retorna { token } para quem chamou esta função.
    return { token };
  }

  // Cria a constante local 'cliente'; usar const evita reatribuição acidental.
  const cliente = await buscarContaClientePorEmail(email);
  // Cria a constante local 'hash'; usar const evita reatribuição acidental.
  const hash = cliente?.senhaHash ?? HASH_FICTICIO;
  // Cria a constante local 'senhaCorreta'; usar const evita reatribuição acidental.
  const senhaCorreta = await bcrypt.compare(senha, hashBcryptCompativel(hash));

  // Condição: se '!cliente || !cliente.senhaHash || !senhaCorreta' for verdadeira, o bloco abaixo é executado.
  if (!cliente || !cliente.senhaHash || !senhaCorreta) {
    // Lança 'NaoAutorizadoError' com ("E-mail ou senha inválidos."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new NaoAutorizadoError("E-mail ou senha inválidos.");
  }

  // Condição: se '!cliente.ativo' for verdadeira, o bloco abaixo é executado.
  if (!cliente.ativo) {
    // Lança 'AcessoProibidoError' com ("Cliente inativo."), interrompendo o fluxo e delegando tratamento ao errorHandler/caller.
    throw new AcessoProibidoError("Cliente inativo.");
  }

  // Cria a constante local 'token'; usar const evita reatribuição acidental.
  const token = jwt.sign(
    { id: cliente.id, email: cliente.email, tipo: "cliente", jti: randomUUID() },
    env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  // Retorna { token } para quem chamou esta função.
  return { token };
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Regras de autenticação/cadastro/perfil do cliente: valida credenciais, emite token de cliente e atualiza dados próprios.
