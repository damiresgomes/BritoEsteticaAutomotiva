import api from "./api";
import type { RespostaListagem } from "./listagem";

// Define e exporta a interface 'Usuario' para tipagem.
export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  cpf?: string;
  senha?: string;
  salario?: number;
  datanascimento?: string;
  criado_em?: string;
}

// Define e exporta o tipo 'CriarUsuarioDTO'.
export type CriarUsuarioDTO = Omit<Usuario, "id" | "criado_em">;
// Define e exporta o tipo 'AtualizarUsuarioDTO'.
export type AtualizarUsuarioDTO = Partial<CriarUsuarioDTO>;

// Exporta a constante 'userService'.
export const userService = {
  async listar(): Promise<Usuario[]> {
  // Declara constante 'response'.
  const response = await api.get<Usuario[]>('/usuarios/listar');
  // Retorna response.data.
  return response.data;
},

  async listarPaginado(pagina: number, limite: number): Promise<RespostaListagem<Usuario>> {
    // Declara constante 'response'.
    const response = await api.get<RespostaListagem<Usuario>>('/usuarios/listar', {
      params: { pagina, limite },
    });
    // Retorna response.data.
    return response.data;
  },

  async buscarPorId(id: number): Promise<Usuario> {
    // Declara constante 'response'.
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    // Retorna response.data.
    return response.data;
  },

  async criar(usuario: CriarUsuarioDTO): Promise<Usuario> {
  // Declara constante 'response'.
  const response = await api.post<Usuario>('/usuarios/cadastro', usuario);
  // Retorna response.data.
  return response.data;
},

  async atualizar(id: number, usuario: AtualizarUsuarioDTO): Promise<Usuario> {
    // Declara constante 'response'.
    const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
    // Retorna response.data.
    return response.data;
  },

  async excluir(id: number): Promise<void> {
    // Aguarda operação assíncrona: api.delete(`/usuarios/${id}`);.
    await api.delete(`/usuarios/${id}`);
  },
};

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Service frontend para operações de usuários/admin.
