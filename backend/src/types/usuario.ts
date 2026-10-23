export type StatusAtivo = "Sim" | "Não";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  salario: number;
  datanascimento: string;
  ativo: StatusAtivo;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  cpf: string;
  salario: number;
  datanascimento: string;
}
