import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";
import { UsuarioRepository } from "../repositories/usuarioRepository";
import { CadastroUsuarioInput } from "../schemas/usuarioSchema";
import { normalizarCpf } from "../validators/cpf";
import { Usuario } from "../entities/usuario";

interface ErroDeBanco {
  code?: string;
  errno?: number;
}

function ehDuplicidade(erro: unknown): boolean {
  const erroBanco = erro as ErroDeBanco | null;

  return erroBanco?.code === "ER_DUP_ENTRY" || erroBanco?.errno === 1062;
}

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async cadastrar(dados: CadastroUsuarioInput): Promise<{ id: number }> {
    const emailEmUso = await this.usuarioRepository.buscarPorEmail(dados.email);

    if (emailEmUso) {
      throw new AppError(409, "E-mail já cadastrado");
    }

    const cpf = normalizarCpf(dados.cpf);
    const cpfEmUso = await this.usuarioRepository.buscarPorCpf(cpf);

    if (cpfEmUso) {
      throw new AppError(409, "CPF já cadastrado");
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const novoUsuario = new Usuario(0, dados.nome, dados.email, cpf, dados.datanascimento, "", senhaHash, dados.salario, "Sim");

    try {
      const id = await this.usuarioRepository.criarUsuario({
        nome: novoUsuario.nome, 
        email: novoUsuario.email,
        senhaHash: novoUsuario.senhaHash,
        cpf: novoUsuario.cpf,
        salario: novoUsuario.salario,
        datanascimento: novoUsuario.dataDeNascimento,
      });

      return { id };
    } catch (erro) {
      if (ehDuplicidade(erro)) {
        throw new AppError(409, "E-mail ou CPF já cadastrado");
      }

      throw erro;
    }
  }

  async listar(): Promise<{ id: number; nome: string; email: string }[]> {
    return this.usuarioRepository.buscarTodos();
  }
}
