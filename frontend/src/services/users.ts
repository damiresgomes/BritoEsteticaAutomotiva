import api from "./api";

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

export type CriarUsuarioDTO = Omit<Usuario, "id" | "criado_em">;
export type AtualizarUsuarioDTO = Partial<CriarUsuarioDTO>;

export const userService = {
  async listar(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>('/usuarios/listar');
  return response.data;
},

  async buscarPorId(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async criar(usuario: CriarUsuarioDTO): Promise<Usuario> {
  const response = await api.post<Usuario>('/usuarios/cadastro', usuario);
  return response.data;
},

  async atualizar(id: number, usuario: AtualizarUsuarioDTO): Promise<Usuario> {
    const response = await api.put<Usuario>(`/usuarios/listar${id}`, usuario);
    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
